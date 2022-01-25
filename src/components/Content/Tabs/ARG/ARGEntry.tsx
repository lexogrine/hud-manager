import { FC, useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';

export interface CardProps {
	id: any;
	text: string;
	toggle: () => void;
	index: number;
	save: () => void;
	active: boolean;
	moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
	index: number;
	id: string;
	type: string;
}

export const Card: FC<CardProps> = ({ id, text, index, moveCard, toggle, active, save }: CardProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [{ handlerId }, drop] = useDrop({
		accept: 'card',
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId()
			};
		},
		drop: () => {
			save();
		},
		hover(item: DragItem, monitor: DropTargetMonitor) {
			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;

			if (dragIndex === hoverIndex) {
				return;
			}

			const hoverBoundingRect = ref.current?.getBoundingClientRect();

			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

			const clientOffset = monitor.getClientOffset();

			const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}

			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}

			moveCard(dragIndex, hoverIndex);
			item.index = hoverIndex;
		}
	});

	const [{ isDragging }, drag] = useDrag({
		type: 'card',
		item: () => {
			return { id, index };
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging()
		})
	});

	const opacity = isDragging ? 0 : 1;
	drag(drop(ref));
	return (
		<div ref={ref} className="arg-setting-entry-container" style={{ opacity }} data-handler-id={handlerId}>
			<div className={`checkbox ${active ? 'active' : ''}`} onClick={toggle}>
				{active ? `✓` : null}
			</div>
			<div className="arg-setting-entry">{text}</div>
		</div>
	);
};
