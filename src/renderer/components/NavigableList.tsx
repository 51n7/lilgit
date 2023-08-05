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
    <ul style={{ listStyle: 'none' }}>
      {items &&
        items.map((item, index) => (
          <li
            key={item.id}
            id={`item-${index}`}
            onClick={() => onItemClick(item)}
            style={{
              cursor: 'pointer',
              backgroundColor:
                selectedIndex === item.id ? '#b1d' : 'transparent',
            }}
          >
            {item.name}
          </li>
        ))}
    </ul>
  );
}

export default NavigableList;
