import { useEffect, useState } from "react";
import "../style/styles.css"

interface RoomControlProps {
    roomSize: {
        width: number;
        height: number;
    };
    onApplyRoomSize: (width: number, height: number) => void;
    onResetRoom: () => void;
}

function RoomControl({ roomSize, onApplyRoomSize, onResetRoom }: RoomControlProps) {
    const [widthInput, setWidthInput] = useState(roomSize.width);
    const [heightInput, setHeightInput] = useState(roomSize.height);
    const handleApply = () => {
        const safeWidth = Math.max(200, widthInput);
        const safeHeight = Math.max(200, heightInput);

        onApplyRoomSize(safeWidth, safeHeight);
    };

    useEffect(() => {
        setWidthInput(roomSize.width);
        setHeightInput(roomSize.height);
    }, [roomSize]);

    return (
        <div className="room-controls">
            <div className="room-controls__title">Roomlie</div>

            <div className="room-controls__size">
                <span>Terem mérete:</span>

                <input
                    type="number"
                    value={widthInput}
                    onChange={(e) => setWidthInput(Number(e.target.value))}
                />

                <span>x</span>

                <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(Number(e.target.value))}
                />

                <button onClick={handleApply}>Alkalmaz</button>
                <button onClick={onResetRoom}>Alaphelyzet</button>
            </div>
        </div>
    );
}

export default RoomControl;