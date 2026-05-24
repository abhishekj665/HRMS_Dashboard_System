import Subscription from "../Subscription/Subscription.model.js";
import Plans from "../Subscription/Plan.model.js";

Subscription.belongsTo(Plans, {
  foreignKey: "planId",
});

Plans.hasMany(Subscription, {
  foreignKey: "planId",
});

export default Subscription;
export { Plans };