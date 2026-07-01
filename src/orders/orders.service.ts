import {
	Injectable,
	NotFoundException,
	BadRequestException,
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
			await this.createCash(order.id, createOrderDto.items);
		} else if (createOrderDto.paymentMethod == 'STRIPE') {
			const sessionId = this.createStripe(createOrderDto);
			await this.createOrder(createOrderDto, sessionId);
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

		const order = await this.db.order.create({
			data: {
				eventId: createOrderDto.eventId,
				buyerName: createOrderDto.buyerName,
				buyerEmail: createOrderDto.buyerEmail,
				paymentMethod: createOrderDto.paymentMethod,
				paymentStatus: PaymentStatus.PENDING,
				stripeSessionId: stripeID,
				totalAmount: ticketTypes
					.map((item) => item.price)
					.reduce((acc, actual) => acc + actual, 0),
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

		return this.db.ticket.createMany({
			data: orderItems.map(
				(item, index): Prisma.TicketCreateManyInput => {
					const matchedOrder = orderItemMap.get(item.ticketTypeId);

					const customFieldValues = matchedOrder?.customFields?.[
						index
					] as Prisma.InputJsonValue | undefined;

					return {
						orderId: order.id,
						ticketTypeId: item.ticketTypeId,
						code: randomBytes(32).toString('hex').toUpperCase(),
						status: TicketStatus.ISSUED,
						holderName: order.buyerName,
						holderEmail: order.buyerEmail,
						customFieldValues,
					};
				},
			),
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
	}

	findOne(id: string) {
		return this.db.order.findUnique({
			where: {
				id: id,
			},
		});
	}
}
