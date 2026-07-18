import { formatIDRShort } from "@/lib/utils";

interface MoneyProps {
  amount: number;
  short?: boolean;
}

export function Money({ amount, short = true }: MoneyProps) {
  return (
    <span className="font-mono tabular-nums">
      {short
        ? formatIDRShort(amount)
        : new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(amount)}
    </span>
  );
}
