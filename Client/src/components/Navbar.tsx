import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

interface User {
  email: string;
  name: string;
  username: string;
  role?: string;
}

const Navbar = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [input, setInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const usersPerPage = 10;
  
  const handleGetUser = async() => {
    try {
      const response = await axios.get<User[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true });
      // console.log(response.data);
      setAllUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  useEffect(() => {
    handleGetUser();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter users whenever input changes
  useEffect(() => {
    if (input.trim().length === 0) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user: User) => {
        const searchTerm = input.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchTerm) ||
          user.name.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm)
        );
      });
      setFilteredUsers(filtered);
    }
    
    // Reset pagination when filter changes
    setPage(1);
  }, [input, allUsers]);
  
  // Update displayed users based on current page
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * usersPerPage;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // When user scrolls near the bottom, load more users
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (displayedUsers.length < filteredUsers.length) {
        setPage(prevPage => prevPage + 1);
      }
    }
  };

  const handleUserSelect = (user: User) => {
    setInput(user.name);
    setIsDropdownOpen(false);
    // You can add additional logic here when a user is selected
  };
  
  return (
    <nav className="flex items-center justify-between px-6 py-4 text-white bg-red-800">
      <div className="text-xl font-bold">YouTube Uploader</div>
      <div className="flex items-center">
        <ul className="flex items-center space-x-6">
          <li>
            <NavLink 
              to="/videos" 
              className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : ""
              }
            >
              Videos
            </NavLink>
          </li>
          <li className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users..."
              className="px-3 py-1 text-black rounded-lg focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={() => setIsDropdownOpen(true)}
            />
            
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute mt-2 w-64 bg-white rounded-md shadow-lg z-10 max-h-64 overflow-y-auto"
                onScroll={handleScroll}
              >
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                      <div className="text-sm text-gray-500">{user?.role}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No users found</div>
                )}
                
                {displayedUsers.length < filteredUsers.length && (
                  <div className="px-4 py-2 text-gray-400 text-center text-xs italic">
                    Scroll for more users
                  </div>
                )}
              </div>
            )}
          </li>
          <li>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : ""
              }
            >
              Profile
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;