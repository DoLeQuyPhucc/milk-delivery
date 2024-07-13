export const formatDate = (date: any) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};
