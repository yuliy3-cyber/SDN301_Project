const token = localStorage.getItem("token");
axios.get("http://localhost:9999/admin/admin", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
