interface CategoryHeaderProps {
  name: string;
}

export const CategoryHeader = ({ name }: CategoryHeaderProps) => {
  return (
    <div className="glass rounded-lg p-3 md:p-4 text-center border border-gold/30">
      <h3 className="font-display text-lg md:text-xl lg:text-2xl text-gold uppercase tracking-wider truncate">
        {name}
      </h3>
    </div>
  );
};
