export interface GetUsersOptions {
  userName?: string;
  phoneNo?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  page?: number;
  perPage?: number;
  whiteLabelId: number;
  parentId?: number;
}
