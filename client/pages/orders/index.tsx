import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import Link from "next/link";

export enum OrderStatus {
  Created = "created",
  Cancelled = "cancelled",
  AwaitingPayment = "awaiting:payment",
  Complete = "complete",
}

interface Ticket {
  id: string;
  title: string;
  price: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  ticket: Ticket;
}

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  [OrderStatus.Complete]: {
    label: "Complete",
    className: "bg-green-100 text-green-800",
  },
  [OrderStatus.Cancelled]: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
  },
  [OrderStatus.Created]: {
    label: "Pending Payment",
    className: "bg-amber-100 text-amber-800",
  },
  [OrderStatus.AwaitingPayment]: {
    label: "Awaiting Payment",
    className: "bg-amber-100 text-amber-800",
  },
};

export default function OrderIndex({ orders }: { orders: Order[] }) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View your ticket reservations and completed purchases
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Browse Tickets
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              You haven&apos;t placed any orders yet.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Ticket
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((order) => {
                  const badge = statusStyles[order.status] ?? {
                    label: order.status,
                    className: "bg-gray-100 text-gray-800",
                  };
                  const isPending =
                    order.status === OrderStatus.Created ||
                    order.status === OrderStatus.AwaitingPayment;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {order.ticket.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        ${Number(order.ticket.price).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {isPending && (
                          <Link
                            href="/orders/[orderId]"
                            as={`/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Complete Payment
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

OrderIndex.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance
) => {
  const { data } = await client.get("/api/orders");
  return { orders: data };
};
