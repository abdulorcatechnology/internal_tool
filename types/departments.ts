export type Department = {
  id: string;
  name: string;
  created_at: string;
};

export type CreateDepartmentInput = {
  name: string;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;
