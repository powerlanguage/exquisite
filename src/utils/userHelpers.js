export function getUserByUsername(username, users) {
  return [users.filter((user) => user.username === username)];
}
