const WP_NAMES = [
  "Esme", "Franny", "Melva", "Aldous", "Percey", "Winston", "Felix", "Durand", 
  "Wilkie", "Haskell", "Louise", "Maren", "Whiting", "Laurel", "Simon", "Oliver",
  "Daisy", "Arthur", "Amelia", "Fiona", "Jasper", "Cora", "Stella", "Miles",
  "Chloe", "Theo", "Hazel", "Finn", "Ruby", "Leo", "Iris", "Silas", "Clara",
  "Ezra", "Luna", "Milo", "Ivy", "Asher", "Lily", "Jude", "Nora", "Rowan",
  "Sadie", "Levi", "Eva", "Eli", "Rose", "Owen", "Lucy", "Caleb", "Grace",
  "Gideon", "Anna", "Micah", "Ella", "Luke", "Mia", "Adam", "Aria", "Noah",
  "Cleo", "Hugh", "Faye", "Dane", "Hope", "Zane", "Dawn", "Seth", "Eve",
  "Tate", "Blythe", "Reid", "Mae", "Gage", "June", "Cole", "Tess", "Lane",
  "Gwen", "Jace", "Ruth", "Nash", "Jane", "Knox", "Pearl", "Beau", "Maia",
  "Vance", "Wren", "Flynn", "Skye", "Hayes", "Fawn", "Rhys", "Lark", "Jett",
  "Sage", "Elm", "Brooks", "Plum", "Beck", "Fern", "Penn", "Ash"
];

export const getInventedName = (productName: string, category: string = '') => {
  if (!productName) return '';
  const isContact = String(category).toLowerCase().includes('contacto');
  if (isContact) return productName;
  
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return WP_NAMES[hash % WP_NAMES.length];
};
