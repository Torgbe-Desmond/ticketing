import { AxiosInstance } from "axios";
import type { NextPageContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import useRequest from "@/hooks/use-request";

interface Ticket {
  id: string;
  userId: string;
  title: string;
  price: number;
  version: number;
  orderId?: string;
}

interface Order {
  id: string;
}

export default function TicketShow({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order: Order) => {      
        console.log(order)
        router.push("/orders/[orderId]", `/orders/${order.id}`)
    }
  });

  const handlePurchase = async () => {
    if (loading) return;
    setLoading(true);
    await doRequest();
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-md">
        <div className="space-y-2 border-b border-gray-100 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Ticket Details
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {ticket.title}
          </h1>
          <p className="text-2xl font-semibold text-gray-700">
            ${Number(ticket.price).toFixed(2)}
          </p>
        </div>

        {errors}

        {ticket.orderId ? (
          <div className="rounded-md bg-amber-50 p-3 text-center text-sm font-medium text-amber-800">
            This ticket is currently reserved.
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Reserving ticket..." : "Purchase"}
          </button>
        )}
      </div>
    </div>
  );
}

TicketShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance
) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};
