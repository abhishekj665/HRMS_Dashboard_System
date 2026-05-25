import Subscription from "../Subscription/Subscription.model.js";
import Plans from "../Subscription/Plan.model.js";

Subscription.belongsTo(Plans, {
  foreignKey: "planId",
  as: "plan",
});

Plans.hasMany(Subscription, {
  foreignKey: "planId",
  as: "subscriptions",
});



export default Subscription;
export { Plans };
