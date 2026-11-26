import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "@/hooks/use-request";

export enum OrderStatus {
  Created = "created",
  Cancelled = "cancelled",
  AwaitingPayment = "awaiting:payment",
  Complete = "complete",
}

export interface Ticket {
  id: string;
  title: string;
  price: number;
  version: number;
}

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: string;
  ticket: Ticket;
  version: number;
}

interface UserPayload {
  id: string;
  email: string;
}

export default function OrderShow({
  order,
  currentUser,
}: {
  order: Order;
  currentUser: UserPayload | null;
}) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (order.status === OrderStatus.Complete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-green-600">Order Complete</h1>
          <p className="text-sm text-gray-600">
            Your purchase of{" "}
            <span className="font-semibold">{order.ticket.title}</span> is
            confirmed.
          </p>
        </div>
      </div>
    );
  }

  if (timeLeft < 0 || order.status === OrderStatus.Cancelled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-md">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-600">Order Expired</h1>
            <p className="text-sm text-gray-500">
              Your reservation for{" "}
              <span className="font-medium text-gray-800">
                {order.ticket.title}
              </span>{" "}
              has timed out.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Browse Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-md">
        <div className="space-y-2 border-b border-gray-100 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Checkout
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {order.ticket.title}
          </h1>
          <p className="text-2xl font-semibold text-gray-700">
            ${Number(order.ticket.price).toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-center">
          <p className="text-sm font-medium text-amber-800">
            Time left to pay:{" "}
            <span className="font-bold tabular-nums">{timeLeft}</span> seconds
          </p>
        </div>

        {errors}

        <div className="flex justify-center">
          {/* <StripeCheckout
            token={({ id }: {id: string }) => console.log(id)}
            stripeKey="pk_test_51UfG17F6w6qhqVvqdPew8nZnmIDgBN95CQuPtHtdKK590ZyCl8Qtaws86f3zx1bPYtHlSjnMPbQ8XO5wDEZyPsBi00AEatty4N"
            amount={Math.round(order.ticket.price * 100)}
            email={currentUser?.email}
          /> */}
        </div>
      </div>
    </div>
  );
}

OrderShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance,
  currentUser: UserPayload | null
) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data, currentUser };
};
