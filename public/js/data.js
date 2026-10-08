/* Conteúdo editável do site: menu, horário, serviços. */
window.POLVO = {
  categories: [
    { id: "all", pt: "Tudo", en: "All" },
    { id: "peixe", pt: "Peixe", en: "Fish" },
    { id: "carnes", pt: "Carnes", en: "Meat" },
    { id: "sopas", pt: "Sopas", en: "Soups" }
  ],

  // gloss: pequena explicação mostrada na versão inglesa · polvo: prato de polvo
  menu: [
    { id: "s1", cat: "sopas", pt: "Sopa de legumes", en: "Vegetable soup", price: 1.9 },
    { id: "s2", cat: "sopas", pt: "Sopa de peixe", en: "Fish soup", price: 2.9 },

    { id: "p1", cat: "peixe", pt: "Sardinhas assadas na brasa", en: "Charcoal-grilled sardines", price: 13.8 },
    { id: "p2", cat: "peixe", pt: "Polvo à lagareiro", en: "Polvo à lagareiro", gloss: "lagareiro-style octopus", price: 23, polvo: true },
    { id: "p3", cat: "peixe", pt: "1/2 polvo à lagareiro", en: "1/2 polvo à lagareiro", gloss: "half portion", price: 17.9, polvo: true },
    { id: "p4", cat: "peixe", pt: "Polvo panado c/ arroz de feijão", en: "Breaded octopus with bean rice", price: 23, polvo: true },
    { id: "p5", cat: "peixe", pt: "Arroz de polvo à pescador", en: "Arroz de polvo à pescador", gloss: "fisherman's octopus rice", price: 32, polvo: true },
    { id: "p6", cat: "peixe", pt: "1/2 arroz de polvo à pescador", en: "1/2 arroz de polvo à pescador", gloss: "half portion", price: 18.9, polvo: true },
    { id: "p7", cat: "peixe", pt: "Arroz de tamboril c/ marisco", en: "Monkfish and seafood rice", price: 36, for2: true },
    { id: "p8", cat: "peixe", pt: "Arroz de marisco", en: "Seafood rice", price: 38, for2: true },
    { id: "p9", cat: "peixe", pt: "Dourado da costa escalada", en: "Butterflied coastal sea bream", price: 18.9 },
    { id: "p10", cat: "peixe", pt: "Lulas grelhadas", en: "Grilled squid", price: 21 },
    { id: "p11", cat: "peixe", pt: "Salmão grelhado", en: "Grilled salmon", price: 19 },
    { id: "p12", cat: "peixe", pt: "Bacalhau à minhota", en: "Bacalhau à minhota", gloss: "Minho-style salt cod", price: 16.5 },

    { id: "c1", cat: "carnes", pt: "Lagarto de porco grelhado", en: "Grilled pork lagarto", gloss: "pork loin strip", price: 15 },
    { id: "c2", cat: "carnes", pt: "Secretos grelhados", en: "Grilled pork secretos", price: 15 },
    { id: "c3", cat: "carnes", pt: "Manta de leitão assada à saloio", en: "Roast suckling pig à saloio", gloss: "country style", price: 14.8 },
    { id: "c4", cat: "carnes", pt: "Carne de porco à alentejana", en: "Carne de porco à alentejana", gloss: "Alentejo-style pork", price: 14.5 },
    { id: "c5", cat: "carnes", pt: "Medalhão de alcatra grelhada", en: "Grilled rump steak medallion", price: 17.5 },
    { id: "c6", cat: "carnes", pt: "Costeleta de novilho grelhada", en: "Grilled beef chop", price: 22 },
    { id: "c7", cat: "carnes", pt: "Picanha grelhada", en: "Grilled picanha", gloss: "rump cap", price: 19.5 },
    { id: "c8", cat: "carnes", pt: "Escalopes de vitela c/ cogumelos e natas", en: "Veal escalopes with mushrooms and cream", price: 16.5 },
    { id: "c9", cat: "carnes", pt: "Bife à casa", en: "House steak", price: 15.5 },
    { id: "c10", cat: "carnes", pt: "Bitoque de novilho grelhado", en: "Grilled beef bitoque", gloss: "Portuguese-style steak", price: 13.5 },
    { id: "c11", cat: "carnes", pt: "Alheira de Mirandela grelhada", en: "Grilled alheira de Mirandela", gloss: "traditional sausage", price: 13 }
  ],

  // Horário por dia da semana (0 = domingo). Fecho após a meia-noite > 24.
  hours: [
    { open: 8, close: 24 }, { open: 8, close: 26 }, { open: 8, close: 26 }, { open: 8, close: 26 },
    { open: 8, close: 26 }, { open: 8, close: 26 }, { open: 8, close: 26 }
  ],

  // Momentos do dia, para a barra "agora no Polvo"
  moments: [
    { from: 8, pt: "Pequeno-almoço", en: "Breakfast" },
    { from: 12, pt: "Almoço", en: "Lunch" },
    { from: 15, pt: "Lanche", en: "Afternoon" },
    { from: 19, pt: "Jantar", en: "Dinner" },
    { from: 23, pt: "Noite", en: "Late" }
  ],

  services: [
    ["Wi-Fi gratuito", "Free Wi-Fi"], ["Esplanada", "Outdoor tables"], ["Ar condicionado", "Air conditioning"],
    ["Estacionamento gratuito", "Free parking"], ["Takeaway", "Takeaway"], ["Catering", "Catering"],
    ["Eventos privados", "Private events"], ["Acessibilidade", "Step-free access"],
    ["Animais bem-vindos", "Pets welcome"], ["Zona de fumadores", "Smoking area"]
  ],

  payments: [
    ["Dinheiro", "Cash"], ["Cartão de débito", "Debit card"], ["Visa", "Visa"], ["Mastercard", "Mastercard"],
    ["American Express", "American Express"], ["Contactless", "Contactless"], ["Ticket Restaurant®", "Ticket Restaurant®"]
  ],

  place: { lat: 39.134, lng: -9.378, mapQuery: "O Polvo, Urbanização do Pisão Lote 2, 2560-042 Santa Cruz, Portugal" }
};
