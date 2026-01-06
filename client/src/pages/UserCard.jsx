import { Button } from "@mui/material";

const UserCard = ({ user }) => {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">
          {user.first_name || "Unnamed User"}
        </h2>

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            user.role === "admin"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {user.role}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p>
          <span className="font-medium text-gray-700">Email:</span> {user.email}
        </p>

        <p>
          <span className="font-medium text-gray-700">Status:</span>{" "}
          {user.isVerified ? (
            <span className="text-green-600">Verified</span>
          ) : (
            <span className="text-red-500">Unverified</span>
          )}
        </p>

        <p>
          <span className="font-medium text-gray-700">Blocked:</span>{" "}
          {user.isBlocked ? "Yes" : "No"}
        </p>
      </div>

      <div className="flex justify-center mt-4">
        {user.isBlocked ? (
          <Button
            variant="contained"
            color="success"
            onClick={() => handleUnBlock(user.id)}
          >
            Unblock
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleBlock(user.id)}
          >
            Block
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
