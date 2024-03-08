"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { RiSearchLine } from "react-icons/ri";
import NavigationBar from "@/app/components/NavigationBar";
import BottomBar from "@/app/components/BottomBar";
import { useRouter } from "next/navigation";

const Page = () => {
  const user = JSON.parse(window.localStorage.getItem("user"));
  const logUserId = user ? user._id : null; // Handle potential undefined user
  console.log(logUserId);

  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState({}); // Use an object for user-specific following state

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/users/all");
        if (response.status === 200) {
          const userMap = {}; // Create a map for efficient following check

          // Pre-populate the userMap with following status (if available)
          response.data.users.forEach((user) => {
            userMap[user._id] =
              user.followers && user.followers.includes(logUserId);
          });

          setUsers(response.data.users);
          setFilteredUsers(response.data.users);
          setIsFollowing(userMap); // Set the following state with userMap
        }
      } catch (error) {
        console.log("get users followers ", error);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleProfile = (userId) => {
    router.push(`/page/user/${userId}`);
  };

  const handleFollow = async (userId) => {
    try {
      const followingState = { ...isFollowing }; // Create a copy to avoid mutation

      if (followingState[userId]) {
        // Check following state for the specific user
        // User is already following, so unfollow
        await axios.post(
          `http://localhost:9000/api/users/unfollow/${logUserId}`,
          {
            userUnfollowId: userId,
          }
        );
        followingState[userId] = false; // Update following state for the user
      } else {
        // User is not following, so follow
        await axios.post(
          `http://localhost:9000/api/users/follow/${logUserId}`,
          {
            userFollowId: userId,
          }
        );
        followingState[userId] = true; // Update following state for the user
      }

      setIsFollowing(followingState);
    } catch (error) {
      console.error(error, "follow");
    }
  };

  return (
    <>
      <NavigationBar />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="w-full md:w-[580px] h-screen overflow-hidden md:p-2 p-3 flex flex-col relative justify-between items-center">
          <div className="h-auto w-full bg-black border-white flex flex-col justify-center items-center border-opacity-30 p-2">
            <div className="h-full w-full flex justify-center items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search"
                  className="w-full rounded-2xl h-14 pl-12 border border-stone-800 placeholder:opacity-30 "
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ backgroundColor: "#0A0A0A" }}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <RiSearchLine className="text-white text-opacity-20" />
                </div>
              </div>
            </div>

            {filteredUsers.map((item) => (
              <div
                key={item._id}
                className="w-full h-auto flex flex-col md:flex-row justify-between items-center border-b-[1px] border-white border-opacity-20 text-white mt-3 p-3"
              >
                <div className="w-full md:w-1/2 h-auto flex justify-start gap-2 items-center mb-3 md:mb-0">
                  <div className="w-12 h-12 bg-black rounded-full overflow-hidden">
                    <img
                      src={
                        item.profilePic
                          ? item.profilePic
                          : "https://static.vecteezy.com/system/resources/thumbnails/005/545/335/small_2x/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg"
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-auto h-auto flex flex-col ms-2">
                    <span
                      className="hover:underline mb-3 md:mb-0"
                      onClick={() => handleProfile(item._id)}
                    >
                      {item.username}
                    </span>
                    <span>{item.followers.length} followers</span>
                  </div>
                </div>

                <div className=" active:scale-95 w-full md:w-28 h-9 border border-white border-opacity-20 rounded-lg flex justify-center items-center">
                  <button onClick={() => handleFollow(item._id)}>
                    {isFollowing[item._id] ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
};

export default Page;
