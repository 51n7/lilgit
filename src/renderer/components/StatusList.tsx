import { GitItem } from 'src/types';

type StatusListProps = {
  items: GitItem[] | undefined;
  onItemClick: (item: GitItem) => void;
  selectedIndex: number | null;
};

function StatusList({ items, onItemClick, selectedIndex }: StatusListProps) {
  return (
    <ul>
      {items &&
        items.map((item, index) => (
          <li key={item.id} id={`item-${index}`} data-status={item.status}>
            <span
              onClick={() => onItemClick(item)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedIndex === item.id ? '#2f7351' : 'transparent',
              }}
            >
              {item.path}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default StatusList;
