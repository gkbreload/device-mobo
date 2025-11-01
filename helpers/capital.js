function capitalizeWords(str) {
  return str
    .split(" ") // Memisahkan string menjadi array kata
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Mengubah huruf pertama menjadi besar
    .join(" "); // Menggabungkan kembali menjadi string
}

module.exports = { capitalizeWords };
