--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-02-26 01:56:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24581)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    genero character varying(20) NOT NULL,
    descripcion text
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24580)
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 219
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- TOC entry 224 (class 1259 OID 49163)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    detalles jsonb,
    total numeric(10,2) NOT NULL,
    estado character varying(50) NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 49162)
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- TOC entry 222 (class 1259 OID 24590)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text NOT NULL,
    precio numeric(10,2) NOT NULL,
    cantidad integer NOT NULL,
    categoria_id integer NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24589)
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 221
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- TOC entry 218 (class 1259 OID 16431)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100),
    correo character varying(100),
    "contraseña" character varying(100),
    rol character varying(50),
    metodo_pago text[] DEFAULT '{}'::character varying[],
    favoritos integer[] DEFAULT '{}'::integer[],
    carrito jsonb DEFAULT '[]'::jsonb,
    pedido_id integer
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16430)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4714 (class 2604 OID 24584)
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 49166)
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 24593)
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 16434)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4879 (class 0 OID 24581)
-- Dependencies: 220
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (1, 'Vestidos Elegantes', 'Mujer', 'Diseños sofisticados que combinan glamour y elegancia, creados con tejidos delicados como seda, encaje o chifón. Perfectos para eventos formales, bodas, cócteles o galas.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (2, 'Vestidos de Verano', 'Mujer', 'Prendas ligeras y frescas, confeccionadas con materiales transpirables como algodón o lino. Presentan estampados coloridos, diseños florales o rayas.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (3, 'Trajes', 'Hombre', 'Conjuntos elegantes compuestos por chaqueta y pantalón, confeccionados con materiales de alta calidad como lana o mezclas de algodón.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (4, 'Zapatos', 'Hombre', 'Calzado diseñado para combinar comodidad y estilo, disponible en una amplia variedad de estilos, desde deportivos hasta formales.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (5, 'Tacones', 'Mujer', 'Calzado elegante que eleva la estatura y estiliza la figura femenina. Disponibles en diferentes alturas y diseños.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (6, 'Corbatas', 'Hombre', 'Accesorios masculinos que añaden un toque de distinción y personalidad. Elaboradas en seda, algodón o materiales sintéticos.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (7, 'Camisas', 'Hombre', 'Prendas versátiles disponibles en diversos cortes y materiales. Pueden ser formales o casuales, representando diferentes niveles de elegancia.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (8, 'Camisas', 'Mujer', 'Diseñadas con variedad de cortes que van desde lo profesional hasta lo casual. Pueden ser entalladas, sueltas, con escotes diferentes.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (9, 'Pantalones', 'Hombre', 'Incluyen una variedad de estilos: formales, casuales, deportivos, confeccionados en diferentes materiales.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (10, 'Pantalones', 'Mujer', 'Amplia gama de estilos que van desde jeans hasta pantalones de vestir, leggins, palazzo y otros diseños.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (11, 'Accesorios', 'Hombre', 'Complementos que refinan y personalizan el look masculino, como relojes, cinturones, gemelos, pañuelos, sombreros y carteras.');
INSERT INTO public.categorias (id, nombre, genero, descripcion) VALUES (12, 'Accesorios', 'Mujer', 'Elementos que completan y realzan un atuendo, como bolsos, joyas, bufandas, sombreros, cinturones y otros.');


--
-- TOC entry 4883 (class 0 OID 49163)
-- Dependencies: 224
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4881 (class 0 OID 24590)
-- Dependencies: 222
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (54, 'Traje a Cuadros Negro y Amarillo', 'Elegante traje, incluye corbata a juego con el traje.', 120000.00, 5, 3, '["/uploads/CarpetasDeProductos/trajeNegroAmarillo/trajeNegroAmarillo.jpg"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (37, 'Tacones Stiletto', 'Zapatos de tacón alto en color blanco', 120000.00, 20, 5, '["/uploads/CarpetasDeProductos/taconesBlancos/taconesBlancos.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (50, 'Cinturón de Cuero', 'Cinturón elegante en cuero marrón', 25000.00, 20, 11, '["/uploads/CarpetasDeProductos/cinturonCafe/cinturonCafe_20241229222520_8.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (41, 'Camisa Blanca', 'Camisa de vestir en algodón', 30000.00, 40, 7, '["/uploads/CarpetasDeProductos/Camisa_Blanca_20250207145442_495/camisaBlanca_20250207145655_890.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (70, 'Camisa Satén', 'Linda camisa satén lisa, color metalizado claro', 30000.00, 6, 8, '["/uploads/CarpetasDeProductos/camisaSaten/camisaSaten_20241224144301_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (28, 'Vestido Midi Cocktail', 'Diseño sofisticado en tono champagne con corte sirena', 160000.00, 15, 1, '["/uploads/CarpetasDeProductos/vestidoAzul/vestidoAzul.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (27, 'Vestido Rojo', 'Vestido elegante en seda con detalles de encaje', 200000.00, 10, 1, '["/uploads/CarpetasDeProductos/vestidoRojoGala/vestidoRojoGala.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (72, 'Pantalón Pierna Ancha', 'Lindo pantalón color blanco de pierna ancha', 30000.00, 5, 10, '["/uploads/CarpetasDeProductos/pantalonPiernaAnchaMujer/pantalonPiernaAnchaMujer_20241224150931_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (78, 'Corbata Azul', 'Corbata azul con diseños dorados', 15000.00, 5, 6, '["/uploads/CarpetasDeProductos/corbataAzul/corbataAzul_20241224154433_2.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (42, 'Camisa Gris', 'Camisa formal de franela', 20000.00, 35, 7, '["/uploads/CarpetasDeProductos/camisaGris/camisaGris.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (44, 'Blusa Bohemia', 'Camisa suelta con detalles románticos', 30000.00, 20, 8, '["/uploads/CarpetasDeProductos/bohemiaBlusa/bohemiaBlusa_20241228163211_4.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (63, 'Tacones Piel', 'Zapatos de tacón elegants', 130000.00, 5, 5, '["/uploads/CarpetasDeProductos/taconPiel/taconPiel_20241223220509_3.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (83, 'Pantalón Azul', 'Pantalón slim, fomal', 40000.00, 4, 9, '["/uploads/CarpetasDeProductos/pantalonAzul/pantalonAzul_20241228162345_8.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (71, 'Pantalón Floral', 'Lindo y fresco pantalón tipo falda larga', 40000.00, 12, 10, '["/uploads/CarpetasDeProductos/pantalonFloral/pantalonFloral_20241229160901_8.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (64, 'Camisa Blanca Playa', 'Ligera Camisa para estar a la moda y fresca al disfrutar un día de playa', 20000.00, 12, 8, '["/uploads/CarpetasDeProductos/camisaBlancaPlaya/camisaBlancaPlaya_20241223221652_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (43, 'Blusa Ejecutiva Blanca', 'Camisa entallada en tono metalizado', 50000.00, 25, 8, '["/uploads/CarpetasDeProductos/blusaBlanca2/blusaBlanca2_20241228163042_7.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (49, 'Reloj Rolex', 'Reloj realizado en plata con detalles azules y rojos, con la más alta calidad en materiales.', 3000000.00, 2, 11, '["/uploads/CarpetasDeProductos/rolex/rolex_20241229161426_4.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (29, 'Vestido Floral con Mangas', 'Vestido fresco con estampado de flores tropical', 70000.00, 20, 2, '["/uploads/CarpetasDeProductos/vestidoFlores/vestidoFlores.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (60, 'Collar de Plata', 'Lindo collar con diseño moderno y elegante', 15000.00, 4, 12, '["/uploads/CarpetasDeProductos/collarMujerCorazonPlata/collarMujerCorazonPlata.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (69, 'Tacones Plata', 'Zapatos de tacón alto, abiertos color, plata', 100000.00, 12, 5, '["/uploads/CarpetasDeProductos/taconesPlata/taconesPlata_20241224144054_9.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (39, 'Corbata de Seda Clásica', 'Corbata en seda lisa color rojo', 20000.00, 30, 6, '["/uploads/CarpetasDeProductos/corbataRoja/corbataRoja_20241223225050_4.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (46, 'Pantalón gris', 'Pantalón corte slim, formal', 40000.00, 50, 9, '["/uploads/CarpetasDeProductos/pantalonGris/pantalonGris.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (73, 'Pantalón Flare', 'Lindo pantalón de mezclilla tipo flare vaquero de tiro alto', 40000.00, 6, 10, '["/uploads/CarpetasDeProductos/jeansFlaredMujer/jeansFlaredMujer_20241224151459_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (58, 'Bolso Blanco Ecocuero', 'Lindo bolso de mano para las damas que tengan que llevar pertenencias sin perder el estilo.', 20000.00, 4, 12, '["/uploads/CarpetasDeProductos/bolsoMujerBlanco/bolsoMujerBlanco.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (47, 'Pantalón Palazzo', 'Pantalón suelto elegante, color verde', 30000.00, 25, 10, '["/uploads/CarpetasDeProductos/pantalonAzulVerde/pantalonAzulVerde_20241229234857_7.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (68, 'Vestido Claro', 'Lindo vestido para usar días de calor, sin dejar de lucir bella y fresca', 35000.00, 5, 2, '["/uploads/CarpetasDeProductos/vestidoPlayaFloreado/vestidoPlayaFloreado_20241224143832_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (82, 'Traje Cafe', 'kajshdjkasd', 100000.00, 3, 3, '["/uploads/CarpetasDeProductos/trajeCafe/trajeCafe_20241228161954_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (77, 'Zapatos Negros', 'Calzado clásico formal de caballero', 70000.00, 9, 4, '["/uploads/CarpetasDeProductos/zapatosNegrosClasicos/zapatosNegrosClasicos_20241224154237_8.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (79, 'Corbata Negra', 'Corbata negra con líneas doradas', 20000.00, 6, 6, '["/uploads/CarpetasDeProductos/corbataNegraDorada/corbataNegraDorada_20241224154542_6.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (80, 'Camisa Celeste', 'Camisa manga larga color celeste', 15000.00, 12, 7, '["/uploads/CarpetasDeProductos/camisaCeleste/camisaCeleste_20241224155005_4.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (75, 'Traje Azul', 'Elegante traje azul para variedad de eventos', 120000.00, 3, 3, '["/uploads/CarpetasDeProductos/trajeAzul/trajeAzul_20241224152708_9.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (81, 'Anillo negro', 'Anillo minimalista para caballeros', 15000.00, 10, 11, '["/uploads/CarpetasDeProductos/anilloNegroHombre/anilloNegroHombre_20241224155346_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (40, 'Corbata Estampada', 'Corbata con diseño geométrico', 15000.00, 25, 6, '["/uploads/CarpetasDeProductos/corbataGEo/corbataGEo_20241224154705_1.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (65, 'Collar negro', 'Lindo collar minimalista y elegante', 15000.00, 13, 11, '["/uploads/CarpetasDeProductos/collarHombreNegro/collarHombreNegro_20241223221845_7.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (67, 'Vestido Corto Blanco', 'Lindo vestido ajustado', 60000.00, 4, 1, '["/uploads/CarpetasDeProductos/vestidoCortoBlanco/vestidoCortoBlanco_20241229161340_8.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (61, 'Collar Corazón de Plata', 'Lindo collar hecho en plata 90%, con grabado personalizable', 15000.00, 6, 12, '["/uploads/CarpetasDeProductos/collarCorazonPlata/collarCorazonPlata.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (84, 'Anillo con Diamante', 'Lindo anillo con diamante real de 18k', 1200000.00, 1, 12, '["/uploads/CarpetasDeProductos/anilloMujer/anilloMujer_20241228163447_4.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (45, 'Pantalón Negro', 'Pantalón formal en corte slim', 70000.00, 30, 9, '["/uploads/CarpetasDeProductos/pantalonNegro/pantalonNegro_20241223224919_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (74, 'Traje Azul Marino', 'Elegante traje oscuro para variedad de eventos', 200000.00, 2, 3, '["/uploads/CarpetasDeProductos/trajeAzulMarino/trajeAzulMarino_20241224153443_1.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (105, 'Collar minimalista', 'ajksdh', 15000.00, 4, 12, '["/uploads/CarpetasDeProductos/Collar_minimalista_20250207151741_365/collarMultiple2_20250207151741_363.webp", "/uploads/CarpetasDeProductos/Collar_minimalista_20250207151741_365/collarMultiple1_20250207151741_774.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (103, 'Zapatos Grises', 'akjshdkajsd', 90000.00, 3, 4, '["/uploads/CarpetasDeProductos/Zapatos_Grises_20250207025935_381/zapatosGrices_20250207025935_306.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (107, 'Tacones Negros', 'asdasdasd', 150000.00, 3, 5, '["/uploads/CarpetasDeProductos/Tacones_Negros_20250207170557_44/taconNegro2_20250207170557_711.webp", "/uploads/CarpetasDeProductos/Tacones_Negros_20250207170557_44/taconNegro_20250207170557_220.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (121, 'Traje a cuadros', 'Elegante traje color caqui, en conjunto.', 220000.00, 7, 3, '["/uploads/CarpetasDeProductos/Traje_a_cuadros_20250208205916_58/traje-cafe-de-3-piezas-2_1800x1800_20250208205916_831.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (59, 'Bolso Piel Ecocuero', 'Lindo bolso de mano para las damas que tengan que llevar pertenencias sin perder el estilo.', 20000.00, 6, 12, '["/uploads/CarpetasDeProductos/bolsoMujerCafe/bolsoMujerCafe.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (76, 'Zapatos Negros con Cafe', 'Calzado formal de alta calidad en materiales y diseño atractivo', 150000.00, 5, 4, '["/uploads/CarpetasDeProductos/zapatosNegrosConCafe/zapatosNegrosConCafe_20241224154140_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (53, 'Vestido Blanco Liviano', 'Lindo vestido perfecto para ir a la playa y pasarla bien sin dejar de  andar fresca y lucir radiante', 25000.00, 3, 2, '["/uploads/CarpetasDeProductos/vestidoCute/vestidoCute_20241223224723_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (31, 'Vestido Damasco', 'Vestido lindo y cómodo', 80000.00, 5, 1, '["/uploads/CarpetasDeProductos/vestidoDamazco/vestidoDamazco_20241229234345_5.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (62, 'Vestido Floreado', 'Lindo vestido pensado para usar los días con calor, sin dejar de lucir bella y fresca', 40000.00, 3, 2, '["/uploads/CarpetasDeProductos/vestidoFloreado/vestidoFloreado_20241229161111_1.webp"]', '2025-02-23 20:47:55.177651-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (129, 'Conjunto Celestie', 'Lindo conjunto de pañoleta, cartera, collar y aros. Perfectos para un regalo', 160000.00, 2, 12, '["/uploads/CarpetasDeProductos/Conjunto_Celestie_20250223210013_709/accesoriosMujer2_20250223210013_999.webp"]', '2025-02-23 21:00:13.598572-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (130, 'Traje clasico', 'Traje negro con corbata a juego, elegante y moderno.', 220000.00, 5, 3, '["/uploads/CarpetasDeProductos/Traje_clasico_20250223210052_710/trajeClasico_20250223210052_459.webp"]', '2025-02-23 21:00:52.651074-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (131, 'Vestido Largo Azul ', 'Lindo vestido azul para variedad de ocaciones', 120000.00, 4, 2, '["/uploads/CarpetasDeProductos/Vestido_Largo_Azul__20250223210213_527/vestidoAzul_20250223210213_767.webp"]', '2025-02-23 21:02:13.586113-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (132, 'Pack Accesorios Hombre', 'Reloj con cinturón a juego, oscuros, minimalista y elegantes', 160000.00, 5, 11, '["/uploads/CarpetasDeProductos/Pack_Accesorios_Hombre_20250223210403_718/accesoriosHombre_20250223210403_825.webp"]', '2025-02-23 21:04:03.437238-03');
INSERT INTO public.productos (id, nombre, descripcion, precio, cantidad, categoria_id, image_url, created_at) VALUES (133, 'Combo Esmerald', 'Conjunto de joyas con una cartera a juego, perfecto para un regalo.', 220000.00, 4, 12, '["/uploads/CarpetasDeProductos/Combo_Esmerald_20250223210449_140/comboAccesoriosMujer_20250223210449_933.webp"]', '2025-02-23 21:04:49.696374-03');


--
-- TOC entry 4877 (class 0 OID 16431)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios (id, nombre, correo, "contraseña", rol, metodo_pago, favoritos, carrito, pedido_id) VALUES (58, 'vendedor', 'vendedor@gmail.com', '$2b$12$vWjTleAJFu1qo/AmOj9/ou/8nClISefAgYrpe5dF1Kj4KQJIo4yqe', 'vendedor', '{}', '{}', '[]', NULL);
INSERT INTO public.usuarios (id, nombre, correo, "contraseña", rol, metodo_pago, favoritos, carrito, pedido_id) VALUES (57, 'admin123', 'admin@gmail.com', '$2b$12$t8yeCnLMUXNURIiNneUaleGeg2KWS0wE.dvAfSYAaT4IZLlHUtjD.', 'admin', '{}', '{116,37,41,63,27,49,47,74,67,130,132}', '[{"color": "Negro", "talla": "L", "cantidad": 1, "producto_id": 41}, {"color": "Gris", "talla": "XL", "cantidad": 1, "producto_id": 37}, {"color": "Negro", "talla": "M", "cantidad": 1, "producto_id": 130}]', NULL);
INSERT INTO public.usuarios (id, nombre, correo, "contraseña", rol, metodo_pago, favoritos, carrito, pedido_id) VALUES (59, 'Esteban Rivas', 'stbnrivasa@gmail.com', '$2b$12$m/BG40QwkMRqPc7QsjhbV.dZi.n1hbkLQU8MZl3/ftFAUWyxwkuom', 'usuario', '{}', '{37}', '[{"color": "Blanco", "talla": "XL", "cantidad": 1, "producto_id": 41}, {"color": "Negro", "talla": "L", "cantidad": 1, "producto_id": 27}, {"color": "Blanco", "talla": "L", "cantidad": 1, "producto_id": 67}, {"color": "Negro", "talla": "L", "cantidad": 1, "producto_id": 81}]', NULL);


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 219
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 12, true);


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 223
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 1, false);


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 221
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 134, true);


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 59, true);


--
-- TOC entry 4724 (class 2606 OID 24588)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 4728 (class 2606 OID 49171)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4726 (class 2606 OID 24597)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 16438)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4722 (class 2606 OID 16436)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 49172)
-- Name: pedidos fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4729 (class 2606 OID 24598)
-- Name: productos productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


-- Completed on 2025-02-26 01:56:07

--
-- PostgreSQL database dump complete
--

