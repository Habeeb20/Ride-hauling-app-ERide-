

import PickupLorryButton from "./suggestions/PickupLorryButton";
import PickupVanButton from "./suggestions/PickupVanButton";
import PickupTrailerButton from "./suggestions/PickupTrailerButton";
import BusTravelButton from "./suggestions/BusTravelButton";
import CharterCarButton from "./suggestions/CharterCarButton";

const Suggestions = () => {
  return (
    <div className="bg-opacity-90 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-white font-semibold">Suggestions</h3>
        <button className="text-sm text-e-ride-purple hover:underline">See all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
     
        <PickupLorryButton />
        <PickupVanButton />
        <PickupTrailerButton />
        <BusTravelButton />
        <CharterCarButton />
      </div>
    </div>
  );
};

export default Suggestions;