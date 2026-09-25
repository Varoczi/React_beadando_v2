import { useState, useMemo } from "react";
import type { TableData } from "../types";
import { getTableDimensions } from "../utils";

export const useTablePhysics = (
  tables: TableData[],
  roomSize: { width: number; height: number },
  scale: number,
  onTableMove: (id: number, newPosition: { x: number; y: number }) => void,
  onDragComplete: (id: number) => void,
) => {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const hasPhysicalCollision = (
    x: number,
    y: number,
    w: number,
    h: number,
    ignoreId: number | null,
  ) => {
    return tables.some((t) => {
      if (t.id === ignoreId) return false;
      const tDim = getTableDimensions(t.type);

      return !(
        x + w <= t.position.x ||
        x >= t.position.x + tDim.w ||
        y + h <= t.position.y ||
        y >= t.position.y + tDim.h
      );
    });
  };

  const conflictedIds = useMemo(() => {
    const ids = new Set<number>();

    tables.forEach((tableA) => {
      const dimA = getTableDimensions(tableA.type);
      const auraA = {
        left: tableA.position.x - dimA.buffer,
        right: tableA.position.x + dimA.w + dimA.buffer,
        top: tableA.position.y - dimA.buffer,
        bottom: tableA.position.y + dimA.h + dimA.buffer,
      };

      tables.forEach((tableB) => {
        if (tableA.id === tableB.id) return;
        const dimB = getTableDimensions(tableB.type);

        const noOverlap =
          auraA.right <= tableB.position.x ||
          auraA.left >= tableB.position.x + dimB.w ||
          auraA.bottom <= tableB.position.y ||
          auraA.top >= tableB.position.y + dimB.h;

        if (!noOverlap) ids.add(tableA.id);
      });
    });

    return Array.from(ids);
  }, [tables]);

  const handleDragStart = (id: number, offsetX: number, offsetY: number) => {
    setDraggingId(id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (
    clientX: number,
    clientY: number,
    roomRect: DOMRect,
  ) => {
    if (draggingId === null) return;
    const table = tables.find((t) => t.id === draggingId);
    if (!table) return;

    let newX = Math.round((clientX - roomRect.left) / scale - dragOffset.x);
    let newY = Math.round((clientY - roomRect.top) / scale - dragOffset.y);

    const { w, h, buffer } = getTableDimensions(table.type);

    if (newX < buffer) newX = buffer;
    if (newY < buffer) newY = buffer;
    if (newX + w + buffer > roomSize.width) newX = roomSize.width - w - buffer;
    if (newY + h + buffer > roomSize.height)
      newY = roomSize.height - h - buffer;

    if (hasPhysicalCollision(newX, newY, w, h, draggingId)) return;

    onTableMove(draggingId, { x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (draggingId !== null) {
      onDragComplete(draggingId);
      setDraggingId(null);
    }
  };

  return {
    draggingId,
    conflictedIds,
    hasPhysicalCollision,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
