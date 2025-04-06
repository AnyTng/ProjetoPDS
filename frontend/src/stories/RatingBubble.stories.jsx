import RatingBubble from "../components/ratingBubble.jsx";
import "../css/global.css";

export default {
  title: "Components/RatingBubble",
  component: RatingBubble,
};

export const Default = () => (
  <div className="p-4">
    <RatingBubble onRate={(value) => console.log("Nota dada:", value)} />
  </div>
);
