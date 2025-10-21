"use cache";

export const getParams = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  return id;
};
