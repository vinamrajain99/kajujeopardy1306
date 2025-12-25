interface CategoryHeaderProps {
  name: string;
}

export const CategoryHeader = ({ name }: CategoryHeaderProps) => {
  return (
    <div className="bg-foreground/90 rounded-lg p-1.5 md:p-2 text-center">
      <h3 className="font-display text-[10px] md:text-xs text-background uppercase tracking-wide line-clamp-2">
        {name || "Category"}
      </h3>
    </div>
  );
};
