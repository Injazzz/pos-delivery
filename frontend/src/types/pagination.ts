/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginatedResponse<T, S = any> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  summary?: S;
}
