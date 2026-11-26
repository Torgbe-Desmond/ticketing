import { AxiosInstance } from "axios";
import type { NextPageContext } from "next";
import Link from "next/link";

interface UserPayload {
  id: string;
  email: string;
}

interface Ticket {
  id: string;
  title: string;
  price: number;
}

interface Props {
  currentUser: UserPayload | null;
  tickets: Ticket[];
}

function LandingPage({ currentUser, tickets }: Props) {
  const ticketList = tickets.map((ticket) => (
    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        {ticket.title}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
        ${Number(ticket.price).toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <Link
          href="/tickets/[ticketId]"
          as={`/tickets/${ticket.id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          View
        </Link>
      </td>
    </tr>
  ));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tickets
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {currentUser
                ? `Signed in as ${currentUser.email}`
                : "Sign in to purchase or list tickets"}
            </p>
          </div>

          {currentUser && (
            <Link
              href="/tickets/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Sell Ticket
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No tickets available right now.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Price
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ticketList}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

LandingPage.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance,
  currentUser: UserPayload | null
) => {
  const { data } = await client.get("/api/tickets");
  return { tickets: data };
};

export default LandingPage;
