/**
 * 🎒 INVENTORY BAR COMPONENT
 *
 * Grid-based inventory system dengan:
 * - 6 slots untuk items
 * - Drag & drop support (future)
 * - Item tooltips
 * - Quick use dengan number keys
 */

import { useState } from 'react';
import { useInventory } from '../../hooks/useGameState';
import { EventBus } from '../../game/systems/EventBus';
import '../styles/InventoryBar.css';

const InventoryBar = () => {
    const { inventory, selectSlot, useItem } = useInventory();
    const [hoveredSlot, setHoveredSlot] = useState(null);

    // ========== HANDLE SLOT CLICK ==========
    const handleSlotClick = (slotIndex) => {
        const item = inventory.items[slotIndex];

        if (!item) {
            selectSlot(null);
            return;
        }

        // Select slot
        selectSlot(slotIndex);

        // Jika double click atau sudah selected, use item
        if (inventory.selectedSlot === slotIndex) {
            handleUseItem(item);
        }
    };

    // ========== USE ITEM ==========
    const handleUseItem = (item) => {
        if (!item) return;

        console.log('Using item:', item.name);

        // Kirim event ke Phaser untuk execute item effect
        EventBus.emit('item:use', item);

        // Update inventory (kurangi quantity atau remove)
        useItem(item.id);
    };

    // ========== RENDER EMPTY SLOTS ==========
    const renderSlots = () => {
        const slots = [];

        for (let i = 0; i < inventory.maxSlots; i++) {
            const item = inventory.items[i];
            const isSelected = inventory.selectedSlot === i;
            const isHovered = hoveredSlot === i;

            slots.push(
                <div
                    key={i}
                    className={`inventory-slot ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                    onClick={() => handleSlotClick(i)}
                    onMouseEnter={() => setHoveredSlot(i)}
                    onMouseLeave={() => setHoveredSlot(null)}
                >
                    {/* Slot Number */}
                    <div className="slot-number">{i + 1}</div>

                    {/* Item Icon */}
                    {item && (
                        <div className="item-icon">
                            {item.icon ? (
                                <img src={item.icon} alt={item.name} />
                            ) : (
                                <div className="item-placeholder">
                                    {item.name.charAt(0)}
                                </div>
                            )}

                            {/* Item Quantity */}
                            {item.quantity > 1 && (
                                <div className="item-quantity">
                                    {item.quantity}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tooltip */}
                    {item && isHovered && (
                        <div className="item-tooltip">
                            <div className="tooltip-name">{item.name}</div>
                            <div className="tooltip-description">
                                {item.description}
                            </div>
                            {item.usable && (
                                <div className="tooltip-action">
                                    Klik untuk gunakan
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return slots;
    };

    return (
        <div className="inventory-bar-container">
            <div className="inventory-header">
                <span className="inventory-label">INVENTORY</span>
                <span className="inventory-count">
                    {inventory.items.length} / {inventory.maxSlots}
                </span>
            </div>

            <div className="inventory-slots">{renderSlots()}</div>

            <div className="inventory-hint">
                Tekan 1-6 untuk quick select | Double click untuk use
            </div>
        </div>
    );
};

export default InventoryBar;
