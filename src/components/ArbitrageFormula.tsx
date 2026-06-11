interface FractionProps {
  numerator: string;
  denominator: string;
}

function Fraction({ numerator, denominator }: FractionProps) {
  return (
    <span className="inline-flex flex-col items-center mx-1 align-middle leading-tight">
      <span className="px-1.5 pb-0.5">{numerator}</span>
      <span className="border-t border-current px-1.5 pt-0.5">{denominator}</span>
    </span>
  );
}

interface ArbitrageFormulaProps {
  className?: string;
}

export default function ArbitrageFormula({ className = "" }: ArbitrageFormulaProps) {
  return (
    <div
      className={`inline-flex flex-wrap items-center font-serif italic text-amber-200 ${className}`}
    >
      <Fraction numerator="1" denominator="kurs₁" />
      <span className="mx-1 not-italic">+</span>
      <Fraction numerator="1" denominator="kurs₂" />
      <span className="mx-1 not-italic">+</span>
      <Fraction numerator="1" denominator="kurs₃" />
      <span className="mx-1.5 not-italic">&lt;</span>
      <span className="not-italic">1</span>
    </div>
  );
}
