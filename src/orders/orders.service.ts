import {
	Injectable,
	NotFoundException,
	BadRequestException,
	NotImplementedException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderItem } from './dto/create-order.dto';
import { DbService } from '../db/db.service';
import { Order, PaymentStatus, Prisma, TicketStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
	constructor(private db: DbService) {}

	async create(createOrderDto: CreateOrderDto) {
		if (createOrderDto.paymentMethod == 'CASH') {
			const order = await this.createOrder(createOrderDto, null);
			return this.createCash(order.id, createOrderDto.items);
		} else if (createOrderDto.paymentMethod == 'STRIPE') {
			const sessionId = this.createStripe(createOrderDto);
			return this.createOrder(createOrderDto, sessionId);
		}
	}

	async createOrder(
		createOrderDto: CreateOrderDto,
		stripeID: string | null,
	): Promise<Order> {
		const ticketTypes = await this.db.ticketType.findMany({
			where: {
				id: {
					in: [
						...new Set(
							createOrderDto.items.map(
								(item) => item.ticketTypeId,
							),
						),
					],
				},
			},
		});

		ticketTypes.forEach((ticket) => {
			if (
				ticket.quantity -
					(ticket.sold +
						(createOrderDto.items.find(
							(i) => i.ticketTypeId == ticket.eventId,
						)?.quantity ?? 0)) <=
				0
			)
				throw new BadRequestException('Not enough Tickets left');
		});

		const order = await this.db.order.create({
			data: {
				eventId: createOrderDto.eventId,
				buyerName: createOrderDto.buyerName,
				buyerEmail: createOrderDto.buyerEmail,
				paymentMethod: createOrderDto.paymentMethod,
				paymentStatus: PaymentStatus.PENDING,
				stripeSessionId: stripeID,
				totalAmount: createOrderDto.items.reduce((acc, item) => {
					const type = ticketTypes.find(
						(t) => t.id === item.ticketTypeId,
					);
					return acc + (type?.price ?? 0) * item.quantity;
				}, 0),
			},
		});
		await this.db.orderItem.createMany({
			data: createOrderDto.items.map(
				(item): Prisma.OrderItemCreateManyInput => ({
					orderId: order.id,
					ticketTypeId: item.ticketTypeId,
					quantity: item.quantity,
					unitPrice:
						ticketTypes.find(
							(ticket) => ticket.id == item.ticketTypeId,
						)?.price ?? 0,
				}),
			),
		});
		return order;
	}

	async createTicket(orderId: string, orderItemsMaker: CreateOrderItem[]) {
		const order = await this.db.order.findUnique({
			where: {
				id: orderId,
			},
		});

		if (!order) {
			//This shouldn't happen, but the IDE is picky
			throw new NotFoundException(`Order with ID ${orderId} not found`);
		}

		if (order.paymentStatus !== 'PAID') {
			throw new BadRequestException({
				error: 'PAYMENT_NOT_SATISFIED',
				details: {
					reason: 'INSUFFICIENT_FUNDS',
				},
			});
		}

		const orderItems = await this.db.orderItem.findMany({
			where: {
				orderId: order.id,
			},
		});

		const orderItemMap = new Map(
			orderItemsMaker.map((o) => [o.ticketTypeId, o]),
		);

		await Promise.all(
			orderItems.map((item) =>
				this.db.ticketType.update({
					where: { id: item.ticketTypeId },
					data: { sold: { increment: item.quantity } },
				}),
			),
		);

		return this.db.ticket.createMany({
			data: orderItems.flatMap((item) => {
				const matchedOrder = orderItemMap.get(item.ticketTypeId);
				return Array.from({ length: item.quantity }, (_, index) => ({
					orderId: order.id,
					ticketTypeId: item.ticketTypeId,
					eventId: order.eventId,
					code: randomBytes(32).toString('hex').toUpperCase(),
					status: TicketStatus.ISSUED,
					holderName: order.buyerName,
					holderEmail: order.buyerEmail,
					customFieldValues:
						matchedOrder?.customFields?.[index] ?? undefined,
				}));
			}),
		});
	}

	async createCash(orderId: string, orderItemsMaker: CreateOrderItem[]) {
		await this.db.order.update({
			where: {
				id: orderId,
			},
			data: {
				paymentStatus: PaymentStatus.PAID,
			},
		});

		return await this.createTicket(orderId, orderItemsMaker);
	}

	createStripe(createOrderDto: CreateOrderDto): string {
		//returns session ID
		return '';
	}

	stripePayment() {
		// if valid create tickets
		throw new NotImplementedException('Stripe is not Implemented yet');
	}

	findOne(id: string) {
		return this.db.order.findUnique({
			where: {
				id: id,
			},
		});
	}

	findTickets(id: string) {
		return this.db.ticket.findMany({
			where: {
				orderId: id,
			},
		});
	}
}
