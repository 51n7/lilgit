import { TransformBranch } from 'src/types';

type BranchListProps = {
  items: TransformBranch[] | undefined;
  onItemClick: (item: TransformBranch) => void;
  selectedIndex: number | null;
};

function BranchesList({ items, onItemClick, selectedIndex }: BranchListProps) {
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
              {`${item.commit} ${item.name}`}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default BranchesList;
