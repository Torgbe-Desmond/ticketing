"use client";

import axios from "axios";
import { useState } from "react";

type Method = "post" | "get" | "patch" | "put" | "delete";

type FieldError = { message: string; field?: string };

interface UseRequestOptions<T> {
  url: string;
  method: Method;
  body?: unknown;
  onSuccess?: (data: T) => void;
}

export default function useRequest<T = any>({
  url,
  method,
  body,
  onSuccess,
}: UseRequestOptions<T>) {
  const [errors, setErrors] = useState<React.ReactNode>(null);

  const doRequest = async (): Promise<T | undefined> => {
    setErrors(null);

    try {
      const response = await axios.request<T>({ url, method, data: body });
      onSuccess?.(response.data);
      return response.data;
    } catch (error: any) {
      const list: FieldError[] = error.response?.data?.errors ?? [
        { message: "Something went wrong" },
      ];

      setErrors(
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4"
        >
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following:
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {list.map((err, i) => (
              <li key={`${err.field ?? "general"}-${i}`}>{err.message}</li>
            ))}
          </ul>
        </div>,
      );
    }
  };

  return { doRequest, errors };
}
