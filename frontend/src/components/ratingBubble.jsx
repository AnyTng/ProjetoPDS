import { useState } from "react";
import bubble from "../assets/evaluateBox.svg";
import starEmpty from "../assets/starEmpty.svg";
import starFilled from "../assets/starFilled.svg";

const RatingBubble = ({ max = 5, onRate }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div
            className="
        inline-flex items-center justify-center
        gap-2 p-3
        bg-no-repeat bg-center bg-contain
        h-16 aspect-[3/1]
        relative
      "
            style={{ backgroundImage: `url(${bubble})` }}
        >
            {/* As estrelas, com um pequeno ajuste vertical */}
            <div className="flex gap-2 items-center -translate-y-[4px]">
                {Array.from({ length: max }).map((_, index) => {
                    const value = index + 1;
                    const filled = hover >= value || (!hover && rating >= value);

                    return (
                        <img
                            key={value}
                            src={filled ? starFilled : starEmpty}
                            alt={`Estrela ${value}`}
                            className="w-6 h-6 cursor-pointer transition-transform hover:scale-110"
                            onMouseEnter={() => setHover(value)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => {
                                setRating(value);
                                onRate?.(value);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default RatingBubble;