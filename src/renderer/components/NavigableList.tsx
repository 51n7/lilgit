import { TransformBranch } from 'src/types';

type NavigableListProps = {
  items: TransformBranch[] | undefined;
  onItemClick: (item: TransformBranch) => void;
  selectedIndex: number | null;
};

function NavigableList({
  items,
  onItemClick,
  selectedIndex,
}: NavigableListProps) {
  return (
    <ul>
      {items &&
        items.map((item, index) => (
          <li
            key={item.id}
            id={`item-${index}`}
            className={item.current ? 'current' : ''}
          >
            <span
              onClick={() => onItemClick(item)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedIndex === item.id ? '#2f7351' : '',
              }}
            >
              {item.name}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default NavigableList;
