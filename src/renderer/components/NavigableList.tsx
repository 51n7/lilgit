// import { useState, KeyboardEvent } from 'react';

interface ListItem {
  id: number;
  text: string;
}

interface NavigableListProps {
  items: ListItem[];
  onItemClick: (item: ListItem) => void;
  selectedIndex: number | null;
}

function NavigableList({
  items,
  onItemClick,
  selectedIndex,
}: NavigableListProps) {
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // const handleItemClick = (index: number) => {
  //   setSelectedIndex(index);
  // };

  return (
    <ul style={{ listStyle: 'none' }}>
      {items.map((item, index) => (
        <li
          key={item.id}
          id={`item-${index}`}
          onClick={() => onItemClick(item)}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedIndex === item.id ? '#b1d' : 'transparent',
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export default NavigableList;
