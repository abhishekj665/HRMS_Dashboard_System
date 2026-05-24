import Payment from "../Payment/Payment.model.js";
import User from "../UserModels/user.model.js";


Payment.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Payment, {
  foreignKey: "userId",
});


export default Payment;
export { User };