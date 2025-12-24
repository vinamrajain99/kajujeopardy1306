interface CategoryHeaderProps {
  name: string;
}

export const CategoryHeader = ({ name }: CategoryHeaderProps) => {
  return (
    <div className="glass rounded-lg p-2 md:p-3 text-center">
      <h3 className="font-display text-xs md:text-sm text-primary uppercase tracking-wide line-clamp-2">
        {name || "Category"}
      </h3>
    </div>
  );
};
