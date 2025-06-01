
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Define interfaces for our data structures
interface Player {
    id: number;
    name: string;
    score: number;
    // category is no longer stored per player globally, chosen each turn
}

interface Question {
    text: string;
    options: string[]; // The first option should be the correct one before shuffling
    correctAnswer: string;
}

interface QuestionsByCategory {
    [category: string]: Question[];
}

// Constants
const MAX_PLAYERS = 4;
const TOTAL_ROUNDS = 5; // Each player answers 5 questions in total
const POINTS_PER_CORRECT_ANSWER = 10;

// Game State
let players: Player[] = [];
let currentPlayerIndex: number = 0;
let currentRound: number = 1; // From 1 to TOTAL_ROUNDS
let playerQuestionCounts: number[] = []; // Tracks how many questions each player has answered
let currentScreen: 'register' | 'category' | 'question' | 'winner' = 'register';
let currentQuestionForTurn: Question | null = null; // The single question for the current player's turn
let chosenCategoryForTurn: string | null = null;

// Tracks categories a player has already chosen in previous rounds
let playerChosenCategories: { [playerId: number]: Set<string> } = {};
// Tracks questions that have been asked globally in the current game session
let globallyAskedQuestionsThisGame: { [category: string]: Set<string> } = {};


// --- PRE-DEFINED QUESTIONS (TRANSLATED TO SPANISH, 25 PER CATEGORY) ---
const allQuestions: QuestionsByCategory = {
    "Ciencia": [
        { text: "¿Cuál es el símbolo químico del agua?", options: ["H2O", "CO2", "O2", "NaCl"], correctAnswer: "H2O" },
        { text: "¿Qué planeta es conocido como el Planeta Rojo?", options: ["Marte", "Júpiter", "Saturno", "Venus"], correctAnswer: "Marte" },
        { text: "¿Qué fuerza atrae los objetos hacia la Tierra?", options: ["Gravedad", "Magnetismo", "Fricción", "Inercia"], correctAnswer: "Gravedad" },
        { text: "¿Cuál es el órgano más grande del cuerpo humano?", options: ["Piel", "Hígado", "Cerebro", "Corazón"], correctAnswer: "Piel" },
        { text: "¿Cuántos colores tiene el arcoíris?", options: ["7", "5", "6", "8"], correctAnswer: "7" },
        { text: "¿Qué gas absorben las plantas de la atmósfera?", options: ["Dióxido de Carbono", "Oxígeno", "Nitrógeno", "Hidrógeno"], correctAnswer: "Dióxido de Carbono" },
        { text: "¿Cuál es la sustancia natural más dura de la Tierra?", options: ["Diamante", "Oro", "Hierro", "Cuarzo"], correctAnswer: "Diamante" },
        { text: "¿Cuál es la velocidad de la luz en el vacío (aproximadamente)?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctAnswer: "300,000 km/s" },
        { text: "¿Qué tipo de estrella es el Sol?", options: ["Enana amarilla", "Gigante roja", "Enana blanca", "Supernova"], correctAnswer: "Enana amarilla" },
        { text: "¿Quién propuso la teoría de la relatividad general?", options: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Stephen Hawking"], correctAnswer: "Albert Einstein" },
        { text: "¿Cuántos huesos tiene un cuerpo humano adulto aproximadamente?", options: ["206", "300", "150", "250"], correctAnswer: "206" },
        { text: "¿Cuál es el proceso por el cual las plantas fabrican su propio alimento?", options: ["Fotosíntesis", "Respiración", "Digestión", "Transpiración"], correctAnswer: "Fotosíntesis" },
        { text: "¿Qué elemento químico tiene el símbolo 'Fe'?", options: ["Hierro", "Flúor", "Francio", "Fósforo"], correctAnswer: "Hierro" },
        { text: "¿Cuál es la unidad básica de la vida?", options: ["Célula", "Átomo", "Molécula", "Tejido"], correctAnswer: "Célula" },
        { text: "¿Qué mide la escala de Richter?", options: ["Magnitud de los terremotos", "Intensidad del viento", "Nivel de pH", "Presión atmosférica"], correctAnswer: "Magnitud de los terremotos" },
        { text: "¿Cuál es el ácido presente en los limones?", options: ["Ácido cítrico", "Ácido acético", "Ácido sulfúrico", "Ácido clorhídrico"], correctAnswer: "Ácido cítrico" },
        { text: "¿Qué científico es famoso por sus leyes del movimiento y la ley de la gravitación universal?", options: ["Isaac Newton", "Galileo Galilei", "Johannes Kepler", "Nicolás Copérnico"], correctAnswer: "Isaac Newton" },
        { text: "¿Cuál es el metal más ligero?", options: ["Litio", "Aluminio", "Titanio", "Magnesio"], correctAnswer: "Litio" },
        { text: "¿Qué parte de la célula contiene el material genético (ADN)?", options: ["Núcleo", "Mitocondria", "Ribosoma", "Citoplasma"], correctAnswer: "Núcleo" },
        { text: "¿Cómo se llama el proceso de división celular que produce gametos (células sexuales)?", options: ["Meiosis", "Mitosis", "Fisión binaria", "Gemación"], correctAnswer: "Meiosis" },
        { text: "¿Cuál es el componente principal del Sol?", options: ["Hidrógeno", "Helio", "Oxígeno", "Carbono"], correctAnswer: "Hidrógeno" },
        { text: "¿Qué fenómeno natural causa las mareas oceánicas?", options: ["Atracción gravitatoria de la Luna y el Sol", "Rotación de la Tierra", "Vientos superficiales", "Corrientes oceánicas"], correctAnswer: "Atracción gravitatoria de la Luna y el Sol" },
        { text: "¿Cuál es el nombre de la galaxia en la que se encuentra nuestro sistema solar?", options: ["Vía Láctea", "Andrómeda", "Triángulo", "Sombrero"], correctAnswer: "Vía Láctea" },
        { text: "¿Qué tipo de energía se obtiene del viento?", options: ["Energía eólica", "Energía solar", "Energía geotérmica", "Energía hidráulica"], correctAnswer: "Energía eólica" },
        { text: "¿Cuál es la capa más externa de la Tierra?", options: ["Corteza", "Manto", "Núcleo externo", "Núcleo interno"], correctAnswer: "Corteza" }
    ],
    "Historia": [
        { text: "¿Quién fue el primer presidente de los Estados Unidos?", options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"], correctAnswer: "George Washington" },
        { text: "¿En qué año terminó la Segunda Guerra Mundial?", options: ["1945", "1939", "1918", "1941"], correctAnswer: "1945" },
        { text: "¿Quién descubrió América en 1492, llegando a las Bahamas?", options: ["Cristóbal Colón", "Leif Erikson", "Américo Vespucio", "Fernando de Magallanes"], correctAnswer: "Cristóbal Colón" },
        { text: "¿Qué antigua civilización construyó las pirámides de Giza?", options: ["Egipcios", "Romanos", "Griegos", "Mayas"], correctAnswer: "Egipcios" },
        { text: "¿Quién escribió 'Romeo y Julieta'?", options: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare" },
        { text: "¿En qué país comenzó el Renacimiento?", options: ["Italia", "Francia", "Inglaterra", "España"], correctAnswer: "Italia" },
        { text: "¿Cuál era el nombre del barco que llevó a los Peregrinos a América en 1620?", options: ["Mayflower", "Santa Maria", "Titanic", "Discovery"], correctAnswer: "Mayflower" },
        { text: "¿Qué emperador romano legalizó el cristianismo?", options: ["Constantino I", "Nerón", "Augusto", "Trajano"], correctAnswer: "Constantino I" },
        { text: "¿Cuál fue la principal causa de la Guerra Fría?", options: ["Conflicto ideológico entre EE.UU. y la URSS", "Disputas territoriales en Europa", "Competencia económica", "Carrera armamentista nuclear"], correctAnswer: "Conflicto ideológico entre EE.UU. y la URSS" },
        { text: "¿Quién fue la reina de Egipto conocida por su relación con Julio César y Marco Antonio?", options: ["Cleopatra VII", "Nefertiti", "Hatshepsut", "Isis"], correctAnswer: "Cleopatra VII" },
        { text: "¿En qué año cayó el Muro de Berlín?", options: ["1989", "1991", "1985", "1961"], correctAnswer: "1989" },
        { text: "¿Qué líder mongol creó uno de los imperios más grandes de la historia?", options: ["Gengis Kan", "Atila el Huno", "Tamerlán", "Kublai Kan"], correctAnswer: "Gengis Kan" },
        { text: "¿Cuál fue el evento que desencadenó la Primera Guerra Mundial?", options: ["El asesinato del Archiduque Francisco Fernando", "La invasión de Polonia", "El hundimiento del Lusitania", "La Revolución Rusa"], correctAnswer: "El asesinato del Archiduque Francisco Fernando" },
        { text: "¿Qué explorador portugués fue el primero en circunnavegar África para llegar a la India?", options: ["Vasco da Gama", "Fernando de Magallanes", "Bartolomé Díaz", "Pedro Álvares Cabral"], correctAnswer: "Vasco da Gama" },
        { text: "¿Quién fue el líder del movimiento por los derechos civiles en Estados Unidos, conocido por su discurso 'Tengo un sueño'?", options: ["Martin Luther King Jr.", "Malcolm X", "Rosa Parks", "Nelson Mandela"], correctAnswer: "Martin Luther King Jr." },
        { text: "¿Qué civilización antigua es famosa por el desarrollo del Coliseo y los acueductos?", options: ["Romana", "Griega", "Persa", "Egipcia"], correctAnswer: "Romana" },
        { text: "¿En qué siglo tuvo lugar la Revolución Francesa?", options: ["Siglo XVIII (1789-1799)", "Siglo XVII", "Siglo XIX", "Siglo XVI"], correctAnswer: "Siglo XVIII (1789-1799)" },
        { text: "¿Quién fue el líder de la Unión Soviética durante la crisis de los misiles en Cuba?", options: ["Nikita Jrushchov", "Iósif Stalin", "Leonid Brézhnev", "Mijaíl Gorbachov"], correctAnswer: "Nikita Jrushchov" },
        { text: "¿Cuál fue el nombre del primer satélite artificial lanzado al espacio por la Unión Soviética en 1957?", options: ["Sputnik 1", "Explorer 1", "Vostok 1", "Luna 1"], correctAnswer: "Sputnik 1" },
        { text: "¿Qué imperio fue gobernado por Carlomagno?", options: ["Imperio Carolingio", "Sacro Imperio Romano Germánico", "Imperio Bizantino", "Imperio Franco"], correctAnswer: "Imperio Carolingio" },
        { text: "¿Cuál fue la 'Ruta de la Seda'?", options: ["Una red de rutas comerciales que conectaba Asia con Europa y África", "Un camino ceremonial en China", "Una estrategia militar romana", "Un peregrinaje religioso en la India"], correctAnswer: "Una red de rutas comerciales que conectaba Asia con Europa y África" },
        { text: "¿Qué figura histórica fue conocida como 'El Libertador' en América del Sur por su papel en las guerras de independencia contra España?", options: ["Simón Bolívar", "José de San Martín", "Bernardo O'Higgins", "Antonio José de Sucre"], correctAnswer: "Simón Bolívar" },
        { text: "¿En qué batalla Napoleón Bonaparte fue derrotado definitivamente en 1815?", options: ["Batalla de Waterloo", "Batalla de Austerlitz", "Batalla de Borodinó", "Batalla de Leipzig"], correctAnswer: "Batalla de Waterloo" },
        { text: "¿Qué documento inglés de 1215 limitó el poder del rey y estableció principios de libertad individual?", options: ["Carta Magna", "Declaración de Derechos", "Edicto de Nantes", "Ley de Habeas Corpus"], correctAnswer: "Carta Magna" },
        { text: "¿Quién fue el primer hombre en pisar la Luna en 1969?", options: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins", "Yuri Gagarin"], correctAnswer: "Neil Armstrong" }
    ],
    "Arte": [
        { text: "¿Quién pintó la Mona Lisa?", options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Claude Monet"], correctAnswer: "Leonardo da Vinci" },
        { text: "¿Con qué movimiento artístico se asocia a Salvador Dalí?", options: ["Surrealismo", "Impresionismo", "Cubismo", "Expresionismo Abstracto"], correctAnswer: "Surrealismo" },
        { text: "¿Cuál es el material principal para las esculturas tradicionales como el David de Miguel Ángel?", options: ["Mármol", "Bronce", "Madera", "Arcilla"], correctAnswer: "Mármol" },
        { text: "¿Quién pintó 'La Noche Estrellada'?", options: ["Vincent van Gogh", "Edvard Munch", "Georgia O'Keeffe", "Frida Kahlo"], correctAnswer: "Vincent van Gogh" },
        { text: "¿Qué forma de arte japonesa consiste en doblar papel?", options: ["Origami", "Ikebana", "Kabuki", "Sumi-e"], correctAnswer: "Origami" },
        { text: "¿Qué artista creó la estatua de 'El Pensador'?", options: ["Auguste Rodin", "Miguel Ángel", "Donatello", "Constantin Brâncuși"], correctAnswer: "Auguste Rodin" },
        { text: "¿Qué color se obtiene tradicionalmente al moler la piedra semipreciosa Lapislázuli?", options: ["Ultramar", "Carmesí", "Verde Esmeralda", "Ocre"], correctAnswer: "Ultramar" },
        { text: "¿Quién es el arquitecto de la Sagrada Familia en Barcelona?", options: ["Antoni Gaudí", "Frank Lloyd Wright", "Le Corbusier", "Zaha Hadid"], correctAnswer: "Antoni Gaudí" },
        { text: "¿Qué movimiento artístico, caracterizado por el uso de formas geométricas, fue cofundado por Pablo Picasso y Georges Braque?", options: ["Cubismo", "Fauvismo", "Futurismo", "Dadaísmo"], correctAnswer: "Cubismo" },
        { text: "¿Cuál de estos no es un color primario en el modelo de color sustractivo (CMY)?", options: ["Verde", "Cian", "Magenta", "Amarillo"], correctAnswer: "Verde" },
        { text: "¿Quién pintó 'El Grito'?", options: ["Edvard Munch", "Gustav Klimt", "Egon Schiele", "Francisco de Goya"], correctAnswer: "Edvard Munch" },
        { text: "¿Qué técnica de pintura utiliza yema de huevo como aglutinante para los pigmentos?", options: ["Temple al huevo", "Óleo", "Acuarela", "Fresco"], correctAnswer: "Temple al huevo" },
        { text: "¿Qué artista mexicano es famoso por sus murales y por estar casado con Frida Kahlo?", options: ["Diego Rivera", "José Clemente Orozco", "David Alfaro Siqueiros", "Rufino Tamayo"], correctAnswer: "Diego Rivera" },
        { text: "¿En qué período artístico se destacó el uso del claroscuro, con fuertes contrastes entre luz y sombra?", options: ["Barroco", "Renacimiento", "Rococó", "Neoclasicismo"], correctAnswer: "Barroco" },
        { text: "¿Cuál de estas es una famosa obra de Andy Warhol?", options: ["Latas de sopa Campbell", "El Jardín de las Delicias", "Los Nenúfares", "Guernica"], correctAnswer: "Latas de sopa Campbell" },
        { text: "¿Qué estilo arquitectónico se caracteriza por arcos apuntados, bóvedas de crucería y vitrales?", options: ["Gótico", "Románico", "Barroco", "Clásico"], correctAnswer: "Gótico" },
        { text: "¿Quién es el autor de la escultura 'Venus de Milo'?", options: ["Desconocido (Antigua Grecia, atribuido a Alexandros de Antioquía)", "Miguel Ángel", "Fidias", "Praxíteles"], correctAnswer: "Desconocido (Antigua Grecia, atribuido a Alexandros de Antioquía)" },
        { text: "¿Qué movimiento artístico del siglo XIX se centró en capturar impresiones momentáneas de luz y color?", options: ["Impresionismo", "Realismo", "Romanticismo", "Simbolismo"], correctAnswer: "Impresionismo" },
        { text: "¿Cómo se llama la técnica de pintura mural realizada sobre yeso húmedo?", options: ["Fresco", "Óleo sobre lienzo", "Gouache", "Pastel"], correctAnswer: "Fresco" },
        { text: "¿Qué artista neerlandés es famoso por sus autorretratos y su uso magistral de la luz y la sombra, como en 'La ronda de noche'?", options: ["Rembrandt van Rijn", "Johannes Vermeer", "Frans Hals", "Jan Steen"], correctAnswer: "Rembrandt van Rijn" },
        { text: "¿Cuál es el nombre del famoso museo de arte en París que alberga la Mona Lisa?", options: ["Museo del Louvre", "Museo de Orsay", "Centro Pompidou", "Museo Británico"], correctAnswer: "Museo del Louvre" },
        { text: "¿Qué movimiento artístico, surgido después de la Primera Guerra Mundial, buscaba expresar el absurdo y la irracionalidad?", options: ["Dadaísmo", "Surrealismo", "Constructivismo", "Futurismo"], correctAnswer: "Dadaísmo" },
        { text: "¿Quién fue el pintor español conocido por obras como 'Las Meninas' y sus retratos de la corte real?", options: ["Diego Velázquez", "Francisco de Goya", "El Greco", "Joan Miró"], correctAnswer: "Diego Velázquez" },
        { text: "¿Qué tipo de arte se caracteriza por el uso de patrones geométricos intrincados y caligrafía, común en la cultura islámica?", options: ["Arte Islámico (Arabesco)", "Arte Bizantino", "Arte Románico", "Arte Gótico"], correctAnswer: "Arte Islámico (Arabesco)" },
        { text: "¿Qué artista estadounidense fue pionero del movimiento Pop Art con obras como 'Díptico de Marilyn'?", options: ["Andy Warhol", "Roy Lichtenstein", "Jasper Johns", "Robert Rauschenberg"], correctAnswer: "Andy Warhol" }
    ],
    "Conocimiento General": [
        { text: "¿Cuál es la capital de Francia?", options: ["París", "Londres", "Berlín", "Madrid"], correctAnswer: "París" },
        { text: "¿Cuántos continentes hay tradicionalmente?", options: ["7", "5", "6", "8"], correctAnswer: "7" },
        { text: "¿Cuál es el océano más grande de la Tierra?", options: ["Océano Pacífico", "Océano Atlántico", "Océano Índico", "Océano Ártico"], correctAnswer: "Océano Pacífico" },
        { text: "¿Cuál es el mamífero más alto?", options: ["Jirafa", "Elefante", "Ballena Azul", "Caballo"], correctAnswer: "Jirafa" },
        { text: "¿Cuántos días tiene un año bisiesto?", options: ["366", "365", "360", "356"], correctAnswer: "366" },
        { text: "¿Cuál es la moneda de Japón?", options: ["Yen", "Won", "Dólar", "Euro"], correctAnswer: "Yen" },
        { text: "¿Qué país es conocido como la Tierra del Sol Naciente?", options: ["Japón", "China", "Corea del Sur", "Tailandia"], correctAnswer: "Japón" },
        { text: "¿Cuál es el río más largo del mundo?", options: ["Amazonas", "Nilo", "Yangtsé", "Misisipi"], correctAnswer: "Amazonas" }, 
        { text: "¿En qué país se encuentra la Torre Eiffel?", options: ["Francia", "Italia", "España", "Alemania"], correctAnswer: "Francia" },
        { text: "¿Cuál es el animal terrestre más rápido?", options: ["Guepardo", "León", "Tigre", "Antílope"], correctAnswer: "Guepardo" },
        { text: "¿Cuántos lados tiene un hexágono?", options: ["6", "5", "7", "8"], correctAnswer: "6" },
        { text: "¿Qué gas es esencial para la respiración humana?", options: ["Oxígeno", "Nitrógeno", "Dióxido de Carbono", "Hidrógeno"], correctAnswer: "Oxígeno" },
        { text: "¿Cuál es la montaña más alta del mundo sobre el nivel del mar?", options: ["Monte Everest", "K2", "Kangchenjunga", "Aconcagua"], correctAnswer: "Monte Everest" },
        { text: "¿Cuál es el metal líquido a temperatura ambiente?", options: ["Mercurio", "Bromo", "Galio", "Cesio"], correctAnswer: "Mercurio" },
        { text: "¿Qué significan las siglas 'FIFA'?", options: ["Federación Internacional de Fútbol Asociación", "Federación Internacional de Fans del Atletismo", "Fondo Internacional para la Financiación Agrícola", "Fuerza Internacional de Fronteras Aliadas"], correctAnswer: "Federación Internacional de Fútbol Asociación" },
        { text: "¿Cuál es la capital de Australia?", options: ["Canberra", "Sídney", "Melbourne", "Brisbane"], correctAnswer: "Canberra" },
        { text: "¿Cuántos jugadores hay en un equipo de fútbol estándar en el campo?", options: ["11", "10", "9", "12"], correctAnswer: "11" },
        { text: "¿Cuál es el desierto más grande del mundo (considerando los desiertos polares)?", options: ["Antártida", "Sahara", "Ártico", "Gobi"], correctAnswer: "Antártida" },
        { text: "¿En qué país se originaron los Juegos Olímpicos antiguos?", options: ["Grecia", "Roma", "Egipto", "China"], correctAnswer: "Grecia" },
        { text: "¿Qué instrumento se usa para medir la temperatura?", options: ["Termómetro", "Barómetro", "Higrómetro", "Anemómetro"], correctAnswer: "Termómetro" },
        { text: "¿Cuál es el idioma más hablado en el mundo por número total de hablantes (nativos + no nativos)?", options: ["Inglés", "Chino Mandarín", "Hindi", "Español"], correctAnswer: "Inglés" },
        { text: "¿Qué país tiene la mayor población del mundo (a 2023)?", options: ["India", "China", "Estados Unidos", "Indonesia"], correctAnswer: "India" },
        { text: "¿Cuál es el nombre del hueso más largo del cuerpo humano?", options: ["Fémur", "Tibia", "Húmero", "Peroné"], correctAnswer: "Fémur" },
        { text: "¿Qué vitamina se obtiene principalmente de la exposición al sol?", options: ["Vitamina D", "Vitamina C", "Vitamina A", "Vitamina B12"], correctAnswer: "Vitamina D" },
        { text: "¿Cuál es el único mamífero capaz de volar activamente?", options: ["Murciélago", "Ardilla voladora", "Colugo", "Pájaro"], correctAnswer: "Murciélago" }
    ],
    "Cultura Pop": [
        { text: "¿Quién dirigió la película 'Pulp Fiction'?", options: ["Quentin Tarantino", "Steven Spielberg", "Martin Scorsese", "Christopher Nolan"], correctAnswer: "Quentin Tarantino" },
        { text: "¿Qué superhéroe de Marvel es conocido como el 'Trepamuros'?", options: ["Spider-Man", "Iron Man", "Capitán América", "Hulk"], correctAnswer: "Spider-Man" },
        { text: "¿Cuál es el nombre del protagonista principal de la serie de anime 'Dragon Ball Z'?", options: ["Goku", "Vegeta", "Gohan", "Piccolo"], correctAnswer: "Goku" },
        { text: "¿Qué famoso manga trata sobre un grupo de piratas en busca del tesoro 'One Piece'?", options: ["One Piece", "Naruto", "Bleach", "Attack on Titan"], correctAnswer: "One Piece" },
        { text: "¿Qué artista es conocido mundialmente como 'El Rey del Pop'?", options: ["Michael Jackson", "Prince", "Madonna", "Elvis Presley"], correctAnswer: "Michael Jackson" },
        { text: "¿En qué popular serie de televisión un profesor de química comienza a fabricar metanfetamina?", options: ["Breaking Bad", "Game of Thrones", "The Sopranos", "Stranger Things"], correctAnswer: "Breaking Bad" },
        { text: "¿Cuál es el nombre del personaje principal que controlas en la mayoría de los juegos de la saga 'The Legend of Zelda'?", options: ["Link", "Zelda", "Ganon", "Sheik"], correctAnswer: "Link" },
        { text: "¿Qué película de 1999 presenta a Keanu Reeves como Neo, un hacker que descubre la verdad sobre su realidad?", options: ["The Matrix", "Fight Club", "The Sixth Sense", "Star Wars: Episodio I"], correctAnswer: "The Matrix" },
        { text: "¿Cómo se llama el hechicero director de la escuela Hogwarts en la mayoría de los libros de Harry Potter?", options: ["Albus Dumbledore", "Severus Snape", "Minerva McGonagall", "Rubeus Hagrid"], correctAnswer: "Albus Dumbledore" },
        { text: "¿Cuál es el nombre de la banda de rock ficticia de la película 'This Is Spinal Tap'?", options: ["Spinal Tap", "The Rutles", "Steel Dragon", "Stillwater"], correctAnswer: "Spinal Tap" },
        { text: "¿Qué personaje de cómic es conocido por su alter ego Bruce Wayne?", options: ["Batman", "Superman", "Iron Man", "Wonder Woman"], correctAnswer: "Batman" },
        { text: "¿En qué universo de ciencia ficción encontrarías a los Jedi y los Sith?", options: ["Star Wars", "Star Trek", "Dune", "Warhammer 40,000"], correctAnswer: "Star Wars" },
        { text: "¿Cuál es el nombre del protagonista de la serie de videojuegos 'Uncharted'?", options: ["Nathan Drake", "Lara Croft", "Master Chief", "Solid Snake"], correctAnswer: "Nathan Drake" },
        { text: "En la serie 'Friends', ¿cuál es el nombre del café donde el grupo pasa mucho tiempo?", options: ["Central Perk", "Monk's", "MacLaren's Pub", "The Leaky Cauldron"], correctAnswer: "Central Perk" },
        { text: "¿Qué actor interpreta a Tony Stark/Iron Man en el Universo Cinematográfico de Marvel?", options: ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo"], correctAnswer: "Robert Downey Jr." },
        { text: "¿Cuál es el nombre del autor de la saga de libros 'Canción de Hielo y Fuego', en la que se basa 'Game of Thrones'?", options: ["George R. R. Martin", "J.K. Rowling", "J.R.R. Tolkien", "Stephen King"], correctAnswer: "George R. R. Martin" },
        { text: "¿Qué videojuego popularizó el género Battle Royale a gran escala?", options: ["PUBG: Battlegrounds (originalmente PlayerUnknown's Battlegrounds)", "Fortnite", "Apex Legends", "Call of Duty: Warzone"], correctAnswer: "PUBG: Battlegrounds (originalmente PlayerUnknown's Battlegrounds)" },
        { text: "En el universo de 'Star Trek', ¿cuál es la frase icónica del Capitán Kirk al dar órdenes a la nave Enterprise?", options: ["'Llévanos, Scotty' (Variaciones de 'Beam us up, Scotty' o 'Energize')", "'Que la Fuerza te acompañe'", "'¡Al infinito y más allá!'", "'Hazlo o no lo hagas, pero no lo intentes'"], correctAnswer: "'Llévanos, Scotty' (Variaciones de 'Beam us up, Scotty' o 'Energize')" },
        { text: "¿Qué serie de anime presenta a un joven ninja llamado Naruto Uzumaki que busca el reconocimiento de sus compañeros?", options: ["Naruto", "Bleach", "One Punch Man", "My Hero Academia"], correctAnswer: "Naruto" },
        { text: "¿Cuál es el nombre del director de películas como 'El Señor de los Anillos' y 'El Hobbit'?", options: ["Peter Jackson", "James Cameron", "Ridley Scott", "Guillermo del Toro"], correctAnswer: "Peter Jackson" },
        { text: "¿Qué personaje de Nintendo es un fontanero italiano que rescata a la Princesa Peach?", options: ["Mario", "Luigi", "Yoshi", "Donkey Kong"], correctAnswer: "Mario" },
        { text: "¿Cuál es el nombre del parque temático de dinosaurios en la película 'Jurassic Park'?", options: ["Jurassic Park", "Dino World", "Isla Nublar Adventure", "Prehistoric Kingdom"], correctAnswer: "Jurassic Park" },
        { text: "¿Qué grupo musical es conocido por el álbum 'The Dark Side of the Moon'?", options: ["Pink Floyd", "Led Zeppelin", "The Who", "Genesis"], correctAnswer: "Pink Floyd" },
        { text: "En la serie 'The Simpsons', ¿cuál es el nombre del dueño del Kwik-E-Mart?", options: ["Apu Nahasapeemapetilon", "Moe Szyslak", "Ned Flanders", "Barney Gumble"], correctAnswer: "Apu Nahasapeemapetilon" },
        { text: "¿Qué actor es famoso por interpretar a Wolverine en las películas de X-Men?", options: ["Hugh Jackman", "Ryan Reynolds", "Chris Pratt", "Patrick Stewart"], correctAnswer: "Hugh Jackman" }
    ],
    "Política": [
        { text: "¿Cuál es el título del jefe de Estado y de Gobierno en Chile?", options: ["Presidente de la República", "Primer Ministro", "Canciller", "Rey"], correctAnswer: "Presidente de la República" },
        { text: "¿Cuántos senadores componen actualmente el Senado de Chile?", options: ["50", "43", "38", "120"], correctAnswer: "50" },
        { text: "¿Quién es considerado el primer emperador romano?", options: ["Augusto", "Julio César", "Nerón", "Trajano"], correctAnswer: "Augusto" },
        { text: "¿En qué antigua ciudad-estado griega se originó la democracia?", options: ["Atenas", "Esparta", "Corinto", "Tebas"], correctAnswer: "Atenas" },
        { text: "¿En qué año Chile proclamó formalmente su independencia de España?", options: ["1818", "1810", "1821", "1808"], correctAnswer: "1818" },
        { text: "¿Qué famoso filósofo ateniense fue maestro de Platón y condenado a muerte bebiendo cicuta?", options: ["Sócrates", "Aristóteles", "Diógenes", "Pitágoras"], correctAnswer: "Sócrates" },
        { text: "¿Qué eran los 'Comicios Centuriados' en la República Romana?", options: ["Una asamblea del pueblo para votar leyes y elegir magistrados", "Un cuerpo de guardaespaldas del cónsul", "Un tribunal supremo de justicia", "Una legión especial del ejército"], correctAnswer: "Una asamblea del pueblo para votar leyes y elegir magistrados" },
        { text: "¿Cuál de las siguientes es una de las tres ramas del poder del Estado en Chile?", options: ["Poder Judicial", "Poder Mediático", "Poder Eclesiástico", "Poder Militar"], correctAnswer: "Poder Judicial" },
        { text: "¿Qué figura histórica chilena es conocida como el 'Libertador de Chile'?", options: ["Bernardo O'Higgins", "José Miguel Carrera", "Manuel Rodríguez", "Arturo Prat"], correctAnswer: "Bernardo O'Higgins" },
        { text: "En la Antigua Roma, ¿quiénes eran los 'plebeyos'?", options: ["La gente común, no patricia", "Los senadores y aristócratas", "Los soldados de las legiones", "Los sacerdotes de los templos"], correctAnswer: "La gente común, no patricia" },
        { text: "¿Qué sistema político predominó en Atenas durante su Edad de Oro bajo Pericles?", options: ["Democracia directa", "Monarquía absoluta", "Oligarquía", "Tiranía"], correctAnswer: "Democracia directa" },
        { text: "¿Cuál fue el principal objetivo de la 'Ley de la Silla' promulgada en Chile en 1917?", options: ["Obligar a los empleadores a proporcionar asientos a sus empleados", "Regular el precio de las sillas", "Establecer normas para la fabricación de sillas", "Limitar el número de sillas en el Congreso"], correctAnswer: "Obligar a los empleadores a proporcionar asientos a sus empleados" },
        { text: "¿Qué líder político chileno fue elegido presidente en 1970 y derrocado en 1973?", options: ["Salvador Allende", "Augusto Pinochet", "Eduardo Frei Montalva", "Patricio Aylwin"], correctAnswer: "Salvador Allende" },
        { text: "En la República Romana, ¿cuál era la función principal de un 'cónsul'?", options: ["Jefe de Estado y comandante militar", "Juez supremo", "Administrador de finanzas", "Líder religioso"], correctAnswer: "Jefe de Estado y comandante militar" },
        { text: "¿Qué importante reforma se implementó en Chile durante el gobierno de Eduardo Frei Montalva relacionada con la propiedad de la tierra?", options: ["Reforma Agraria", "Nacionalización del Cobre", "Creación del Banco Central", "Establecimiento del sufragio femenino"], correctAnswer: "Reforma Agraria" },
        { text: "¿Cómo se llama el parlamento de Chile?", options: ["Congreso Nacional", "Asamblea Nacional", "Cortes Generales", "Parlamento Federal"], correctAnswer: "Congreso Nacional" },
        { text: "En la Antigua Roma, ¿qué era el 'Senado'?", options: ["Un consejo de ancianos y nobles con gran influencia política", "La principal corte de justicia", "El cuartel general del ejército", "Una escuela para jóvenes patricios"], correctAnswer: "Un consejo de ancianos y nobles con gran influencia política" },
        { text: "¿Qué batalla en Chile es conmemorada cada 21 de mayo por su heroísmo naval?", options: ["Combate Naval de Iquique", "Batalla de Maipú", "Batalla de Chacabuco", "Sitio de Rancagua"], correctAnswer: "Combate Naval de Iquique" },
        { text: "¿Qué filósofo griego es conocido por su obra 'La República', donde describe una sociedad ideal?", options: ["Platón", "Aristóteles", "Sócrates", "Epicuro"], correctAnswer: "Platón" },
        { text: "¿Cuál fue el periodo de gobierno militar en Chile que comenzó en 1973 y terminó en 1990?", options: ["Dictadura Militar (o Régimen Militar)", "República Parlamentaria", "Gobierno de Unidad Popular", "Transición a la Democracia"], correctAnswer: "Dictadura Militar (o Régimen Militar)" },
        { text: "En Atenas, ¿qué era la 'Ekklesía'?", options: ["La asamblea de ciudadanos que tomaba decisiones políticas", "El tribunal supremo", "El consejo de los quinientos", "El templo principal de la ciudad"], correctAnswer: "La asamblea de ciudadanos que tomaba decisiones políticas" },
        { text: "¿Quién fue el primer Presidente de Chile elegido democráticamente tras el fin del régimen militar en 1990?", options: ["Patricio Aylwin", "Ricardo Lagos", "Eduardo Frei Ruiz-Tagle", "Michelle Bachelet"], correctAnswer: "Patricio Aylwin" },
        { text: "En la Roma antigua, ¿qué eran las 'Guerras Púnicas'?", options: ["Una serie de tres guerras entre Roma y Cartago", "Conflictos internos entre patricios y plebeyos", "Campañas militares para conquistar Grecia", "Rebeliones de esclavos lideradas por Espartaco"], correctAnswer: "Una serie de tres guerras entre Roma y Cartago" },
        { text: "¿Cuál es la actual Constitución Política de la República de Chile (a 2023, aunque en proceso de cambio)?", options: ["La Constitución de 1980 (con sus reformas)", "La Constitución de 1925", "La Constitución de 1833", "Una nueva constitución post-2022"], correctAnswer: "La Constitución de 1980 (con sus reformas)" },
        { text: "¿Qué filósofo político inglés escribió 'Leviatán', defendiendo un contrato social y un gobierno absoluto?", options: ["Thomas Hobbes", "John Locke", "Jean-Jacques Rousseau", "Montesquieu"], correctAnswer: "Thomas Hobbes" }
    ],
    "Música": [
        { text: "¿Qué banda británica es famosa por su icónica canción 'Bohemian Rhapsody'?", options: ["Queen", "The Beatles", "Led Zeppelin", "Pink Floyd"], correctAnswer: "Queen" },
        { text: "¿Quién es ampliamente reconocido como 'El Rey del Rock and Roll'?", options: ["Elvis Presley", "Chuck Berry", "Little Richard", "Buddy Holly"], correctAnswer: "Elvis Presley" },
        { text: "¿Con qué género musical se asocia principalmente al artista jamaiquino Bob Marley?", options: ["Reggae", "Ska", "Calipso", "Rocksteady"], correctAnswer: "Reggae" },
        { text: "¿Qué artista pop femenina es conocida por éxitos globales como 'Shake It Off' y 'Blank Space'?", options: ["Taylor Swift", "Ariana Grande", "Beyoncé", "Lady Gaga"], correctAnswer: "Taylor Swift" },
        { text: "¿Qué instrumento de viento metal fue emblemático en la música de Louis Armstrong?", options: ["Trompeta", "Saxofón", "Trombón", "Clarinete"], correctAnswer: "Trompeta" },
        { text: "¿Qué influyente banda chilena de rock es conocida por canciones como 'La Voz de los \\'80' y 'Tren al Sur'?", options: ["Los Prisioneros", "La Ley", "Los Jaivas", "Soda Stereo"], correctAnswer: "Los Prisioneros" },
        { text: "¿Cuál es el nombre del masivo festival musical que se realiza anualmente en Viña del Mar, Chile?", options: ["Festival Internacional de la Canción de Viña del Mar", "Lollapalooza Chile", "Rock en Conce", "Santiago Gets Louder"], correctAnswer: "Festival Internacional de la Canción de Viña del Mar" },
        { text: "¿Qué banda de Liverpool revolucionó la música popular en la década de 1960?", options: ["The Beatles", "The Rolling Stones", "The Who", "The Kinks"], correctAnswer: "The Beatles" },
        { text: "¿Cuál de estos instrumentos es de percusión?", options: ["Batería", "Guitarra", "Violín", "Flauta"], correctAnswer: "Batería" },
        { text: "¿Quién compuso las 'Cuatro Estaciones'?", options: ["Antonio Vivaldi", "Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven"], correctAnswer: "Antonio Vivaldi" },
        { text: "¿Qué género musical originado en el sur de Estados Unidos es precursor del Rock and Roll?", options: ["Blues", "Jazz", "Country", "Gospel"], correctAnswer: "Blues" },
        { text: "¿Cuál es el nombre artístico de la cantante chilena Mon Laferte?", options: ["Mon Laferte", "Norma Monserrat Bustamante Laferte", "Monserrat Laferte", "Norma Bustamante"], correctAnswer: "Mon Laferte" },
        { text: "¿Qué banda de rock alternativo estadounidense es conocida por su álbum 'Nevermind'?", options: ["Nirvana", "Pearl Jam", "Soundgarden", "Red Hot Chili Peppers"], correctAnswer: "Nirvana" },
        { text: "¿Cómo se llama la escala musical básica de siete notas que se repite en diferentes octavas?", options: ["Escala diatónica", "Escala pentatónica", "Escala cromática", "Modo musical"], correctAnswer: "Escala diatónica" },
        { text: "¿Qué famoso cantante y compositor argentino es conocido por canciones como 'De Música Ligera' y 'Persiana Americana' con Soda Stereo?", options: ["Gustavo Cerati", "Charly García", "Fito Páez", "Andrés Calamaro"], correctAnswer: "Gustavo Cerati" },
        { text: "¿Qué cantante estadounidense es conocida como la 'Reina del Pop'?", options: ["Madonna", "Whitney Houston", "Mariah Carey", "Janet Jackson"], correctAnswer: "Madonna" },
        { text: "¿Cuál de estos compositores es considerado uno de los 'Tres Grandes B' de la música clásica alemana?", options: ["Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Frédéric Chopin", "Pyotr Ilyich Tchaikovsky"], correctAnswer: "Johann Sebastian Bach" }, // Beethoven y Brahms son los otros.
        { text: "¿Qué género musical se caracteriza por la improvisación, los ritmos sincopados y el 'swing'?", options: ["Jazz", "Clásica", "Folk", "Country"], correctAnswer: "Jazz" },
        { text: "¿Cuál es el nombre de la cantante colombiana conocida por éxitos como 'Hips Don't Lie' y 'Waka Waka'?", options: ["Shakira", "Karol G", "Jennifer Lopez", "Rosalía"], correctAnswer: "Shakira" },
        { text: "¿Qué instrumento musical tiene 88 teclas y se toca percutiendo cuerdas con martillos?", options: ["Piano", "Órgano", "Clavecín", "Acordeón"], correctAnswer: "Piano" },
        { text: "¿Qué banda de rock irlandesa es liderada por el vocalista Bono?", options: ["U2", "The Cranberries", "Thin Lizzy", "Snow Patrol"], correctAnswer: "U2" },
        { text: "¿Cómo se llama la entrega anual de premios a la industria musical estadounidense presentada por la Academia Nacional de Artes y Ciencias de la Grabación?", options: ["Premios Grammy", "Premios Billboard", "MTV Video Music Awards", "American Music Awards"], correctAnswer: "Premios Grammy" },
        { text: "¿Qué cantante y compositora chilena es una figura emblemática del movimiento de la Nueva Canción Chilena, conocida por 'Gracias a la Vida'?", options: ["Violeta Parra", "Mercedes Sosa", "Isabel Parra", "Chabuca Granda"], correctAnswer: "Violeta Parra" },
        { text: "¿Qué tipo de voz masculina es la más aguda?", options: ["Tenor", "Barítono", "Bajo", "Contratenor"], correctAnswer: "Tenor" }, // Contratenor es más específico, pero tenor es el más común agudo.
        { text: "¿Cuál es el nombre del festival de música electrónica más grande del mundo, celebrado en Bélgica?", options: ["Tomorrowland", "Ultra Music Festival", "Electric Daisy Carnival", "Creamfields"], correctAnswer: "Tomorrowland" }
    ],
    "Cultura Tuerca": [
        { text: "¿Qué prestigiosa marca de automóviles alemana es famosa por su deportivo modelo 911?", options: ["Porsche", "BMW", "Mercedes-Benz", "Audi"], correctAnswer: "Porsche" },
        { text: "¿Qué significa la sigla 'CV' cuando se habla de la potencia de un motor de automóvil?", options: ["Caballos de Vapor", "Cilindrada Volumétrica", "Capacidad Vehicular", "Consumo Variable"], correctAnswer: "Caballos de Vapor" },
        { text: "¿Qué tipo de configuración de motor es característica de muchas motocicletas Harley-Davidson?", options: ["V-Twin (Bicilíndrico en V)", "En línea de 4 cilindros", "Bóxer (Cilindros opuestos)", "Monocilíndrico"], correctAnswer: "V-Twin (Bicilíndrico en V)" },
        { text: "¿Qué fabricante de automóviles japonés es conocido por modelos populares como el Civic y el Accord?", options: ["Honda", "Toyota", "Nissan", "Mazda"], correctAnswer: "Honda" },
        { text: "¿Cuál es la función principal del radiador en el sistema de un automóvil?", options: ["Enfriar el motor disipando el calor del refrigerante", "Filtrar el aceite del motor", "Mezclar aire y combustible", "Generar electricidad para la batería"], correctAnswer: "Enfriar el motor disipando el calor del refrigerante" },
        { text: "¿Qué marca italiana de superdeportivos de lujo utiliza un toro embravecido en su logotipo?", options: ["Lamborghini", "Ferrari", "Maserati", "Pagani"], correctAnswer: "Lamborghini" },
        { text: "En un motor de gasolina, ¿qué componente es responsable de encender la mezcla de aire y combustible dentro de los cilindros?", options: ["Bujía", "Inyector de combustible", "Válvula de admisión", "Pistón"], correctAnswer: "Bujía" },
        { text: "¿Qué significa 'ABS' en el contexto de los frenos de un automóvil?", options: ["Sistema Antibloqueo de Ruedas", "Asistencia de Frenado Suave", "Aceleración Brusca Segura", "Amortiguador Bilateral Sincronizado"], correctAnswer: "Sistema Antibloqueo de Ruedas" },
        { text: "¿Qué marca de automóviles estadounidense es conocida por su modelo Mustang?", options: ["Ford", "Chevrolet", "Dodge", "Jeep"], correctAnswer: "Ford" },
        { text: "¿Cuál de estos es un tipo de transmisión de automóvil?", options: ["Manual", "Radial", "Diagonal", "Longitudinal"], correctAnswer: "Manual" },
        { text: "¿Qué famoso rally raid se considera una de las carreras más duras del mundo, anteriormente conocido como París-Dakar?", options: ["Rally Dakar", "Rally de Montecarlo", "24 Horas de Le Mans", "Indianápolis 500"], correctAnswer: "Rally Dakar" },
        { text: "¿Qué indica la 'cilindrada' de un motor?", options: ["El volumen total que desplazan los pistones en los cilindros", "La cantidad de combustible que consume", "La velocidad máxima que puede alcanzar", "El número de válvulas por cilindro"], correctAnswer: "El volumen total que desplazan los pistones en los cilindros" },
        { text: "¿Qué fabricante de motocicletas japonés es conocido por modelos como la Ninja y la Vulcan?", options: ["Kawasaki", "Yamaha", "Suzuki", "Honda"], correctAnswer: "Kawasaki" },
        { text: "En un motor de combustión interna, ¿qué pieza se mueve hacia arriba y hacia abajo dentro del cilindro?", options: ["Pistón", "Cigüeñal", "Árbol de levas", "Biela"], correctAnswer: "Pistón" },
        { text: "¿Qué marca de automóviles de lujo británica es conocida por modelos como el Phantom y el Ghost?", options: ["Rolls-Royce", "Bentley", "Aston Martin", "Jaguar"], correctAnswer: "Rolls-Royce" },
        { text: "¿Cuál es el nombre de la famosa carrera de resistencia de 24 horas que se celebra en Francia?", options: ["24 Horas de Le Mans", "Gran Premio de Mónaco", "500 Millas de Indianápolis", "Rally de Finlandia"], correctAnswer: "24 Horas de Le Mans" },
        { text: "¿Qué tipo de tracción implica que la potencia del motor se envía solo a las ruedas delanteras?", options: ["Tracción Delantera (FWD)", "Tracción Trasera (RWD)", "Tracción en las Cuatro Ruedas (AWD/4WD)", "Tracción Total Permanente"], correctAnswer: "Tracción Delantera (FWD)" },
        { text: "¿Qué componente del sistema de escape de un automóvil ayuda a reducir las emisiones nocivas?", options: ["Convertidor catalítico", "Silenciador", "Colector de escape", "Tubo de escape"], correctAnswer: "Convertidor catalítico" },
        { text: "¿Qué marca alemana es propietaria de Audi, Bentley, Bugatti, Lamborghini y Porsche, entre otras?", options: ["Volkswagen Group", "BMW Group", "Mercedes-Benz Group", "Stellantis"], correctAnswer: "Volkswagen Group" },
        { text: "En motociclismo, ¿qué significa 'MotoGP'?", options: ["La categoría reina del Campeonato del Mundo de Motociclismo de Velocidad", "Un tipo específico de motocicleta de gran turismo", "Una asociación de fabricantes de motocicletas", "Un evento de motocross extremo"], correctAnswer: "La categoría reina del Campeonato del Mundo de Motociclismo de Velocidad" },
        { text: "¿Qué tipo de motor no utiliza bujías para encender la mezcla de combustible y aire, sino la alta compresión?", options: ["Motor diésel", "Motor de gasolina", "Motor Wankel (rotativo)", "Motor eléctrico"], correctAnswer: "Motor diésel" },
        { text: "¿Qué fabricante de automóviles es conocido por ser pionero en vehículos eléctricos con su modelo Tesla Roadster y posteriormente el Model S?", options: ["Tesla, Inc.", "Nissan", "Chevrolet", "BMW"], correctAnswer: "Tesla, Inc." },
        { text: "¿Cuál es la función del alternador en un automóvil?", options: ["Recargar la batería y suministrar energía eléctrica al vehículo cuando el motor está en marcha", "Arrancar el motor", "Enfriar el motor", "Regular la mezcla de aire y combustible"], correctAnswer: "Recargar la batería y suministrar energía eléctrica al vehículo cuando el motor está en marcha" },
        { text: "¿Qué marca japonesa de motocicletas es conocida por la serie 'GSX-R' de deportivas?", options: ["Suzuki", "Yamaha", "Honda", "Kawasaki"], correctAnswer: "Suzuki" },
        { text: "¿Qué es el 'chasis' de un vehículo?", options: ["La estructura base o armazón sobre la que se montan los demás componentes", "El motor y la transmisión", "El sistema de suspensión y dirección", "La carrocería exterior"], correctAnswer: "La estructura base o armazón sobre la que se montan los demás componentes" }
    ],
    "Tecnología": [
        { text: "¿Qué empresa desarrolló el sistema operativo iOS, utilizado en iPhones y iPads?", options: ["Apple", "Google", "Microsoft", "Samsung"], correctAnswer: "Apple" },
        { text: "¿Cuál es el nombre del asistente virtual desarrollado por Amazon, comúnmente asociado a sus altavoces inteligentes Echo?", options: ["Alexa", "Siri", "Google Assistant", "Cortana"], correctAnswer: "Alexa" },
        { text: "¿Qué significa la sigla 'IA' en el contexto tecnológico actual?", options: ["Inteligencia Artificial", "Interfaz Avanzada", "Interconexión Autónoma", "Identificación Automática"], correctAnswer: "Inteligencia Artificial" },
        { text: "¿Qué red social, conocida por sus mensajes cortos, fue renombrada a 'X' en 2023?", options: ["X (anteriormente Twitter)", "Facebook", "Instagram", "TikTok"], correctAnswer: "X (anteriormente Twitter)" },
        { text: "¿Qué tecnología de comunicación inalámbrica de corto alcance es estándar para conectar dispositivos como auriculares, teclados y ratones a computadoras o teléfonos?", options: ["Bluetooth", "Wi-Fi", "NFC", "Infrared"], correctAnswer: "Bluetooth" },
        { text: "¿Quién es ampliamente reconocido como uno de los cofundadores de Microsoft y una figura clave en la revolución del PC?", options: ["Bill Gates", "Steve Jobs", "Larry Page", "Mark Zuckerberg"], correctAnswer: "Bill Gates" },
        { text: "¿Qué plataforma de streaming de video, propiedad de Google, es la más utilizada a nivel mundial para compartir y ver videos?", options: ["YouTube", "Netflix", "Vimeo", "Twitch"], correctAnswer: "YouTube" },
        { text: "¿Qué término describe un espacio virtual colectivo y compartido, creado por la convergencia de la realidad física virtualmente mejorada y el espacio virtual físicamente persistente?", options: ["Metaverso", "Ciberespacio", "Realidad Virtual Pura", "Mundo Digital Conectado"], correctAnswer: "Metaverso" },
        { text: "¿Qué lenguaje de programación es fundamental para el desarrollo web front-end, permitiendo interactividad y dinamismo en las páginas web?", options: ["JavaScript", "Python", "Java", "C#"], correctAnswer: "JavaScript" },
        { text: "¿Qué tipo de activo digital utiliza criptografía para asegurar transacciones, controlar la creación de unidades adicionales y verificar la transferencia de activos?", options: ["Criptomoneda", "Bono Digital", "Acción Virtual", "Token de Seguridad"], correctAnswer: "Criptomoneda" },
        { text: "¿Cuál fue uno de los primeros navegadores web gráficos que popularizó el acceso a la World Wide Web, lanzado en 1993 por el NCSA?", options: ["Mosaic", "Netscape Navigator", "Internet Explorer", "Opera"], correctAnswer: "Mosaic" },
        { text: "¿Qué compañía tecnológica es la principal diseñadora y vendedora de microprocesadores (CPU) para computadoras personales, con series como Core y Xeon?", options: ["Intel", "AMD", "Nvidia", "Qualcomm"], correctAnswer: "Intel" },
        { text: "¿Qué tecnología de comunicación inalámbrica permite realizar pagos sin contacto acercando un smartphone o una tarjeta a un terminal de punto de venta?", options: ["NFC (Near Field Communication)", "RFID", "Bluetooth Low Energy", "Código QR Dinámico"], correctAnswer: "NFC (Near Field Communication)" },
        { text: "¿Cuál es el nombre del ambicioso proyecto de internet satelital desarrollado por la empresa SpaceX de Elon Musk?", options: ["Starlink", "Kuiper Systems", "OneWeb", "Globalstar"], correctAnswer: "Starlink" },
        { text: "En el contexto de direcciones web, ¿qué significa la sigla 'URL'?", options: ["Localizador Uniforme de Recursos", "Red Universal de Enlace", "Ubicación de Recurso Lógico", "Ruta Unificada de Localización"], correctAnswer: "Localizador Uniforme de Recursos" },
        { text: "¿Qué significa 'HTML' en el desarrollo web?", options: ["HyperText Markup Language (Lenguaje de Marcado de Hipertexto)", "High Tech Modern Language", "Hyper Transfer Machine Language", "Home Tool Markup Language"], correctAnswer: "HyperText Markup Language (Lenguaje de Marcado de Hipertexto)" },
        { text: "¿Cuál es el nombre de la empresa que desarrolló el sistema operativo Android?", options: ["Google (originalmente Android Inc., adquirida por Google)", "Samsung", "Apple", "Microsoft"], correctAnswer: "Google (originalmente Android Inc., adquirida por Google)" },
        { text: "¿Qué tecnología se utiliza para almacenar datos en la 'nube'?", options: ["Computación en la Nube (Cloud Computing)", "Almacenamiento Local en Red (NAS)", "Discos Duros Externos Masivos", "Redes Privadas Virtuales (VPN)"], correctAnswer: "Computación en la Nube (Cloud Computing)" },
        { text: "¿Qué tipo de ataque informático intenta obtener información confidencial (como contraseñas o detalles de tarjetas de crédito) haciéndose pasar por una entidad confiable?", options: ["Phishing", "Malware", "Ransomware", "Ataque DDoS"], correctAnswer: "Phishing" },
        { text: "¿Cuál fue el primer videojuego comercialmente exitoso, lanzado por Atari en 1972?", options: ["Pong", "Space Invaders", "Pac-Man", "Donkey Kong"], correctAnswer: "Pong" },
        { text: "¿Qué significa 'VPN'?", options: ["Virtual Private Network (Red Privada Virtual)", "Very Public Network", "Verified Personal Number", "Volatile Program Nexus"], correctAnswer: "Virtual Private Network (Red Privada Virtual)" },
        { text: "¿Quién es considerado el 'padre de la World Wide Web' por inventar el sistema de hipertexto en 1989?", options: ["Tim Berners-Lee", "Vint Cerf", "Robert Kahn", "Linus Torvalds"], correctAnswer: "Tim Berners-Lee" },
        { text: "¿Qué dispositivo de Apple, lanzado en 2007, revolucionó la industria de los teléfonos móviles?", options: ["iPhone", "iPod Touch", "iPad", "MacBook Air"], correctAnswer: "iPhone" },
        { text: "¿Qué plataforma de redes sociales se centra en compartir fotos y videos cortos, propiedad de Meta Platforms?", options: ["Instagram", "TikTok", "Snapchat", "Pinterest"], correctAnswer: "Instagram" },
        { text: "En el desarrollo de software, ¿qué es 'Open Source' (Código Abierto)?", options: ["Software cuyo código fuente está disponible públicamente para ser usado, modificado y distribuido", "Software que es gratuito pero no se puede modificar", "Software desarrollado por una comunidad abierta sin fines de lucro", "Un estándar de programación para la interoperabilidad"], correctAnswer: "Software cuyo código fuente está disponible públicamente para ser usado, modificado y distribuido" }
    ]
};
const availableCategories = Object.keys(allQuestions);

// DOM Elements
const appContainer = document.getElementById('app-container') as HTMLDivElement;

// --- UTILITY FUNCTIONS ---
/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Gets a unique random question from a specific category, avoiding questions already asked globally in the current game.
 * @param category The category to get a question from.
 * @returns A Question object or null if no unique questions are available globally in that category for this game.
 */
function getUniqueRandomQuestion(category: string): Question | null {
    const categoryQuestions = allQuestions[category];
    if (!categoryQuestions || categoryQuestions.length === 0) {
        console.warn(`No hay preguntas definidas para la categoría: ${category}`);
        return null;
    }

    const askedGloballyInThisGameForCategory = globallyAskedQuestionsThisGame[category];
    if (!askedGloballyInThisGameForCategory) {
        console.error(`El conjunto de preguntas globales no fue inicializado para la categoría: ${category}`);
        return null; // Should not happen if initialized correctly in handleStartGame
    }

    let availableQuestions = categoryQuestions.filter(q => !askedGloballyInThisGameForCategory.has(q.text));

    if (availableQuestions.length === 0) {
        // All unique questions in this category have been asked globally in this game.
        // Do not allow repeats within the current game session (5 rounds).
        console.warn(`Todas las preguntas únicas para la categoría "${category}" ya han sido formuladas globalmente en esta partida.`);
        return null;
    }

    const shuffledAvailable = shuffleArray([...availableQuestions]);
    const chosenQuestion = shuffledAvailable[0];
    
    return chosenQuestion;
}


// --- RENDERING FUNCTIONS ---

/** Renders the persistent header scoreboard. */
function renderHeaderScoreboard() {
    const headerScoreboardContainer = document.getElementById('header-scoreboard-container');
    if (!headerScoreboardContainer) {
        const newHeaderContainer = document.createElement('div');
        newHeaderContainer.id = 'header-scoreboard-container';
        newHeaderContainer.className = 'header-scoreboard';
        appContainer.prepend(newHeaderContainer); // Prepend to appContainer
    }

    const containerToUpdate = document.getElementById('header-scoreboard-container')!;
    if (players.length > 0 && (currentScreen === 'category' || currentScreen === 'question')) {
        containerToUpdate.innerHTML = `
            ${players.map(player => `
                <div class="player-score-item ${player.id === players[currentPlayerIndex].id ? 'active-player-score' : ''}">
                    <span class="player-name">${player.name}</span>: 
                    <span class="player-score">${player.score}</span>
                </div>
            `).join('')}
        `;
        containerToUpdate.style.display = 'flex';
    } else {
        containerToUpdate.innerHTML = ''; // Clear if not in game or no players
        containerToUpdate.style.display = 'none';
    }
}

/** Renders the player registration screen. */
function renderRegisterScreen() {
    currentScreen = 'register';
    renderHeaderScoreboard(); // Clear/hide header scoreboard
    appContainer.innerHTML = `
        <div class="screen-content player-registration-screen">
            <h1>¡Juego de Fiesta Quiz!</h1>
            <h2>Ingresa los Nombres de los Jugadores</h2>
            <div id="player-inputs" class="player-inputs">
                ${Array.from({ length: MAX_PLAYERS }, (_, i) => `
                    <div class="player-input-group">
                        <label for="player-name-${i + 1}">Jugador ${i + 1}:</label>
                        <input type="text" id="player-name-${i + 1}" placeholder="Ingresar nombre" maxlength="20" aria-label="Nombre del Jugador ${i + 1}">
                    </div>
                `).join('')}
            </div>
            <button id="start-game-button" disabled>Iniciar Juego</button>
            <p id="error-message" class="error-message" role="alert" aria-live="assertive"></p>
        </div>
    `;
    // Re-prepend header container if it was cleared
    const headerContainerCheck = document.getElementById('header-scoreboard-container');
    if (!headerContainerCheck) {
        const newHeaderContainer = document.createElement('div');
        newHeaderContainer.id = 'header-scoreboard-container';
        newHeaderContainer.className = 'header-scoreboard';
        appContainer.prepend(newHeaderContainer);
    }


    const inputs = appContainer.querySelectorAll<HTMLInputElement>('input[type="text"]');
    const startGameButton = appContainer.querySelector<HTMLButtonElement>('#start-game-button')!;
    const errorMessageElement = appContainer.querySelector<HTMLParagraphElement>('#error-message')!;

    function validateInputs() {
        let filledCount = 0;
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                filledCount++;
            }
        });
        startGameButton.disabled = filledCount === 0;
        if (filledCount === 0 && document.activeElement !== startGameButton && !startGameButton.disabled) {
             errorMessageElement.textContent = 'Por favor, ingresa al menos un nombre de jugador.';
        } else {
            errorMessageElement.textContent = '';
        }
    }

    inputs.forEach(input => input.addEventListener('input', validateInputs));
    startGameButton.addEventListener('click', handleStartGame);
    validateInputs(); // Initial check
}

/** Renders the category selection screen for the current player. */
function renderCategoryScreen() {
    currentScreen = 'category';
    renderHeaderScoreboard();
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerId = currentPlayer.id;
    const chosenByCurrentPlayerSet = playerChosenCategories[currentPlayerId] || new Set<string>();

    const screenContent = appContainer.querySelector('.screen-content') || createScreenContentContainer();

    screenContent.innerHTML = `
        <div class="category-selection-screen">
            <h2><span class="highlight-player">${currentPlayer.name}</span>, elige tu categoría para la Ronda ${currentRound}:</h2>
            <div class="category-buttons">
                ${availableCategories.map(category => {
                    const isChosenByPlayer = chosenByCurrentPlayerSet.has(category);
                    // Check if category is globally exhausted (all questions asked in this game)
                    // This is more for information if we wanted to disable it visually if *globally* exhausted too
                    // but the primary disabling is for *player's past choices*.
                    // const isGloballyExhausted = (globallyAskedQuestionsThisGame[category]?.size || 0) >= (allQuestions[category]?.length || 0);
                    
                    return `
                        <button 
                            class="category-button ${isChosenByPlayer ? 'disabled-category' : ''}" 
                            data-category="${category}"
                            ${isChosenByPlayer ? 'disabled' : ''}
                            aria-disabled="${isChosenByPlayer}"
                        >
                            ${category}
                        </button>
                    `;
                }).join('')}
            </div>
            <p id="category-error-message" class="error-message" role="alert" aria-live="assertive"></p>
        </div>
    `;

    screenContent.querySelectorAll<HTMLButtonElement>('.category-button:not(.disabled-category)').forEach(button => {
        button.addEventListener('click', () => handleCategorySelect(button.dataset.category!));
    });
}

/** Renders the question screen for the current player. */
function renderQuestionScreen() {
    currentScreen = 'question';
    renderHeaderScoreboard();
    const currentPlayer = players[currentPlayerIndex];
    
    if (!currentQuestionForTurn) {
        // This should ideally be caught in handleCategorySelect before reaching here.
        console.error("Error Crítico: No hay pregunta disponible para este turno al renderizar la pantalla de pregunta.");
        alert(`¡Ups! Ocurrió un error al cargar la pregunta. Se intentará regresar a la selección de categoría.`);
        chosenCategoryForTurn = null; // Reset chosen category for turn
        renderCategoryScreen(); 
        return;
    }
    const question = currentQuestionForTurn;
    const shuffledOptions = shuffleArray([...question.options]);

    const screenContent = appContainer.querySelector('.screen-content') || createScreenContentContainer();
    screenContent.innerHTML = `
        <div class="question-screen">
            <div class="question-header">
                <h3>Turno de <span class="highlight-player">${currentPlayer.name}</span> - Ronda ${currentRound}</h3>
                <p>Categoría: ${chosenCategoryForTurn}</p>
            </div>
            <p class="question-text">${question.text}</p>
            <div class="answer-options">
                ${shuffledOptions.map(option => `
                    <button class="answer-button" data-answer="${option}">${option}</button>
                `).join('')}
            </div>
            <div id="feedback-area" class="feedback-text" role="status" aria-live="polite"></div>
            <div id="next-button-container" class="next-button-container hidden">
                 <button id="next-action-button">Siguiente</button>
            </div>
        </div>
    `;

    screenContent.querySelectorAll<HTMLButtonElement>('.answer-button').forEach(button => {
        button.addEventListener('click', () => handleAnswerSelect(button.dataset.answer!, question.correctAnswer));
    });
}

/** Renders the final winner screen with fireworks. */
function renderWinnerScreen() {
    currentScreen = 'winner';
    renderHeaderScoreboard(); // Hide header scoreboard
    
    let highestScore = -1;
    players.forEach(player => {
        if (player.score > highestScore) {
            highestScore = player.score;
        }
    });
    const winners = players.filter(player => player.score === highestScore);
    const winnerNames = winners.map(w => w.name).join(' & ');

    const screenContent = appContainer.querySelector('.screen-content') || createScreenContentContainer();
    screenContent.innerHTML = `
        <div class="winner-screen">
            <h1>¡Juego Terminado!</h1>
            ${winners.length > 0 ? `
                <h2>${highestScore > 0 ? (winners.length > 1 ? '¡Es un Empate!' : '¡Ganador!') : '¡Bien Jugado!'}</h2>
                <p class="winner-name">${winnerNames}</p>
                ${highestScore > 0 ? `<p class="winner-score">Puntuación: ${highestScore}</p>` : ''}
            ` : `<h2>No hay un ganador claro, ¡pero bien jugado por todos!</h2>`}
            <div id="fireworks-container"></div>
            <button id="play-again-button" class="play-again-button">Jugar de Nuevo</button>
        </div>
    `;
    
    if (highestScore > 0) {
        startFireworks();
    }
    screenContent.querySelector<HTMLButtonElement>('#play-again-button')!.addEventListener('click', resetGame);
}

/** Helper to ensure screen-content div exists */
function createScreenContentContainer(): HTMLDivElement {
    let screenContent = appContainer.querySelector<HTMLDivElement>('.screen-content');
    if (screenContent) {
        screenContent.innerHTML = ''; // Clear existing content
    } else {
        screenContent = document.createElement('div');
        screenContent.className = 'screen-content';
        // Ensure header is always before content if dynamically creating both
        const header = document.getElementById('header-scoreboard-container');
        if (header) {
            header.insertAdjacentElement('afterend', screenContent);
        } else {
            appContainer.appendChild(screenContent);
        }
    }
    return screenContent;
}


// --- GAME LOGIC HANDLERS ---

/** Handles the start of the game after player registration. */
function handleStartGame() {
    players = [];
    playerQuestionCounts = [];
    playerChosenCategories = {}; 
    globallyAskedQuestionsThisGame = {}; // Reset globally asked questions

    // Initialize sets for globally asked questions for each category
    availableCategories.forEach(category => {
        globallyAskedQuestionsThisGame[category] = new Set<string>();
    });

    const nameInputs = appContainer.querySelectorAll<HTMLInputElement>('#player-inputs input[type="text"]');
    let playerIdCounter = 0;
    nameInputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            players.push({ id: playerIdCounter, name, score: 0 });
            playerQuestionCounts.push(0);
            playerChosenCategories[playerIdCounter] = new Set<string>(); // Initialize for each player
            playerIdCounter++;
        }
    });

    if (players.length > 0) {
        currentRound = 1;
        currentPlayerIndex = 0;
        renderCategoryScreen();
    } else {
        const errorMessageElement = appContainer.querySelector<HTMLParagraphElement>('#error-message')!;
        errorMessageElement.textContent = 'Por favor, ingresa al menos un nombre de jugador.';
    }
}

/** Handles a player's category selection. */
function handleCategorySelect(category: string) {
    const currentPlayer = players[currentPlayerIndex];
    chosenCategoryForTurn = category;

    // Mark that the player has chosen this category for this turn.
    // This makes it greyed out for them in their future turns.
    playerChosenCategories[currentPlayer.id].add(category);

    // Attempt to get a globally unique question for this category
    currentQuestionForTurn = getUniqueRandomQuestion(category);

    const categoryErrorMessageElement = document.getElementById('category-error-message') as HTMLParagraphElement | null;
    if (categoryErrorMessageElement) categoryErrorMessageElement.textContent = ''; // Clear previous error

    if (!currentQuestionForTurn) {
        // No unique question available globally for this category in this game.
        // Inform the player and let them choose another category.
        if (categoryErrorMessageElement) {
            categoryErrorMessageElement.textContent = `¡Lo sentimos, ${currentPlayer.name}! No quedan preguntas únicas en la categoría "${chosenCategoryForTurn}" para esta partida. Por favor, elige otra categoría.`;
        } else {
            alert(`¡Lo sentimos, ${currentPlayer.name}! No quedan preguntas únicas en la categoría "${chosenCategoryForTurn}" para esta partida. Por favor, elige otra categoría.`);
        }
        // The category they just tried will now be greyed out due to the playerChosenCategories.add(category) above.
        renderCategoryScreen(); // Re-render to show the updated disabled state and message
        return;
    }

    // If a question was successfully found, mark it as globally asked for this game.
    if (globallyAskedQuestionsThisGame[category]) {
        globallyAskedQuestionsThisGame[category].add(currentQuestionForTurn.text);
    } else {
        // This case should not happen if globallyAskedQuestionsThisGame is initialized correctly.
        console.error(`Error: globallyAskedQuestionsThisGame no está inicializado para la categoría ${category} al intentar marcar una pregunta.`);
    }
    
    renderQuestionScreen();
}

/** Handles a player's answer selection. */
function handleAnswerSelect(selectedAnswer: string, correctAnswer: string) {
    const answerButtons = appContainer.querySelectorAll<HTMLButtonElement>('.answer-button');
    const feedbackArea = appContainer.querySelector<HTMLDivElement>('#feedback-area')!;
    const nextButtonContainer = appContainer.querySelector<HTMLDivElement>('#next-button-container')!;
    const nextButton = appContainer.querySelector<HTMLButtonElement>('#next-action-button')!;

    let isCorrect = false;
    if (selectedAnswer === correctAnswer) {
        players[currentPlayerIndex].score += POINTS_PER_CORRECT_ANSWER;
        feedbackArea.textContent = "¡Correcto! 🎉";
        feedbackArea.className = "feedback-text correct";
        isCorrect = true;
    } else {
        feedbackArea.textContent = `¡Incorrecto! La respuesta correcta era: ${correctAnswer}`;
        feedbackArea.className = "feedback-text incorrect";
    }
    playerQuestionCounts[currentPlayerIndex]++;
    renderHeaderScoreboard(); // Update score display immediately

    answerButtons.forEach(button => {
        button.disabled = true;
        if (button.dataset.answer === correctAnswer) {
            button.classList.add('correct-answer-highlight');
        }
        if (button.dataset.answer === selectedAnswer && !isCorrect) {
            button.classList.add('selected-incorrect');
        }
    });

    nextButtonContainer.classList.remove('hidden');
    nextButton.focus();
    nextButton.onclick = advanceTurnOrEndGame;
}

/** Advances to the next player's turn or the next round, or ends the game. */
function advanceTurnOrEndGame() {
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        // Next player in the same round
        renderCategoryScreen();
    } else {
        // All players have finished this round
        currentRound++;
        currentPlayerIndex = 0;
        if (currentRound <= TOTAL_ROUNDS) {
            // Start next round
            renderCategoryScreen();
        } else {
            // Game over
            renderWinnerScreen();
        }
    }
}

/** Resets the game to the player registration screen. */
function resetGame() {
    players = [];
    currentPlayerIndex = 0;
    currentRound = 1;
    playerQuestionCounts = [];
    currentQuestionForTurn = null;
    chosenCategoryForTurn = null;
    playerChosenCategories = {}; 
    globallyAskedQuestionsThisGame = {}; // Clear globally asked questions log
    
    // Clear any fireworks
    const fireworksContainer = document.getElementById('fireworks-container');
    if (fireworksContainer) fireworksContainer.innerHTML = '';

    renderRegisterScreen();
}

// --- FIREWORKS ---
function startFireworks() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;
    container.innerHTML = ''; // Clear previous fireworks

    for (let i = 0; i < 20; i++) { // Create 20 fireworks
        setTimeout(() => {
            createFirework(container);
        }, Math.random() * 2000); // Stagger their appearance
    }
}

function createFirework(container: HTMLElement) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    const x = Math.random() * 90 + 5; 
    const y = Math.random() * 70 + 10; 
    firework.style.left = `${x}%`;
    firework.style.top = `${y}%`;

    const colors = ['gold', 'red', 'lime', 'blue', 'cyan', 'magenta', 'yellow'];
    firework.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    firework.style.setProperty('--firework-scale', (Math.random() * 15 + 10).toString());

    container.appendChild(firework);

    firework.addEventListener('animationend', () => {
        firework.remove();
    });
}


// --- INITIALIZATION ---
/** Initializes the game by rendering the first screen. */
function initializeGame() {
    const headerContainer = document.getElementById('header-scoreboard-container');
    if (!headerContainer) {
        const newHeaderContainer = document.createElement('div');
        newHeaderContainer.id = 'header-scoreboard-container';
        newHeaderContainer.className = 'header-scoreboard';
        appContainer.appendChild(newHeaderContainer); // Append header first
    }

    const contentContainer = document.querySelector('.screen-content'); // Use querySelector for class
     if (!contentContainer) {
        createScreenContentContainer(); // Call helper that appends after header
    }
    
    if (currentScreen === 'register') {
        renderRegisterScreen();
    } else { 
        resetGame(); 
    }
}

// Start the game
initializeGame();
