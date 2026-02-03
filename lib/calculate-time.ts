export default function calculateTimeTogether(startDate: string) {
  if (!startDate) return "";
  
  const start = new Date(startDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mês" : "meses"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);

  if (parts.length === 0) return "Começamos hoje! ❤️";
  
  // Formata a string com vírgulas e "e" no final
  if (parts.length === 1) return parts[0];
  const lastPart = parts.pop();
  return `${parts.join(", ")} e ${lastPart}`;
}
