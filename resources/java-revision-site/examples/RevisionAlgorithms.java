import java.util.*;
import java.util.function.*;

/** Java 21, sans dépendances. Algorithmes pédagogiques ; contrats explicites. */
public final class RevisionAlgorithms {
    private RevisionAlgorithms() { }

    // BEGIN divisor
    public static boolean estDiviseur(int nb, int diviseur) {
        return diviseur != 0 && nb % diviseur == 0;
    }
    // END divisor

    // BEGIN salary
    /** Retour en kEUR ; grade inconnu / anciennete invalide => 0. */
    public static double calculSalaire(String grade, int anciennete) {
        if (grade == null) return 0;
        return switch (grade) {
            case "Concepteur" -> switch (anciennete) {
                case 1 -> 15; case 2 -> 17; case 3 -> 19; default -> 0;
            };
            case "Ingénieur" -> switch (anciennete) {
                case 1 -> 23; case 2 -> 25; case 3 -> 27; default -> 0;
            };
            case "Développeur" -> switch (anciennete) {
                case 1 -> 35; case 2 -> 40; case 3 -> 45; default -> 0;
            };
            default -> 0;
        };
    }
    // END salary

    // BEGIN perfect
    public static boolean estParfait(int n) {
        if (n <= 1) return false;
        long somme = 1; // somme des diviseurs propres positifs
        for (int d = 2; d <= n / d; d++) { // evite d*d qui deborde
            if (n % d == 0) {
                somme += d;
                int autre = n / d;
                if (autre != d) somme += autre; // carre parfait : pas deux fois
            }
        }
        return somme == n;
    }
    public static List<Integer> parfaits(int min, int max) {
        if (min > max) throw new IllegalArgumentException("min > max");
        List<Integer> resultat = new ArrayList<>();
        for (long n = Math.max(2, min); n <= max; n++) {
            if (estParfait((int)n)) resultat.add((int)n);
        }
        return resultat;
    }
    // END perfect

    // BEGIN uppercase
    public static boolean uneMajusculeAscii(String s) {
        Objects.requireNonNull(s, "s");
        int i = 0;
        while (i < s.length() && (s.charAt(i) < 'A' || s.charAt(i) > 'Z')) i++;
        return i < s.length();
    }
    public static boolean uneMajusculeUnicode(String s) {
        Objects.requireNonNull(s, "s");
        return s.codePoints().anyMatch(Character::isUpperCase);
    }
    // END uppercase

    // BEGIN randomarray
    /** Bornes inclusives ; Random fourni pour rendre les tests reproductibles. */
    public static int[] tableauAleatoire(int taille, int min, int max, Random random) {
        Objects.requireNonNull(random, "random");
        if (taille < 0 || min > max) throw new IllegalArgumentException("bornes");
        int[] a = new int[taille];
        long amplitude = (long) max - min + 1;
        for (int i = 0; i < a.length; i++) {
            a[i] = (int) ((long) min + random.nextLong(amplitude));
        }
        return a;
    }
    // END randomarray

    // BEGIN describe
    public static String decrire(int[] a) {
        Objects.requireNonNull(a, "a");
        StringBuilder b = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) {
            if (i > 0) b.append(", ");
            b.append(a[i]);
        }
        return b.append(']').toString();
    }
    // END describe

    // BEGIN sums
    public static long sommeI(int n) {
        if (n < 0) throw new IllegalArgumentException("n < 0");
        long s = 0;
        for (long i = 1; i <= n; i++) s += i;
        return s;
    }
    /** Pour de petits n : une grande profondeur peut epuiser la pile. */
    public static long sommeR(int n) {
        if (n < 0) throw new IllegalArgumentException("n < 0");
        if (n == 0) return 0;
        return n + sommeR(n - 1);
    }
    public static long sommeFormule(int n) {
        if (n < 0) throw new IllegalArgumentException("n < 0");
        return (long) n * (n + 1L) / 2;
    }
    // END sums

    // BEGIN fibonacci
    /** Version naive volontairement limitee a 35 (cout exponentiel). */
    public static long fibonacciR(int n) {
        if (n < 0 || n > 35) throw new IllegalArgumentException("0 <= n <= 35");
        return fibRec(n);
    }
    private static long fibRec(int n) {
        if (n < 2) return n;
        return fibRec(n - 1) + fibRec(n - 2);
    }
    /** F(0)=0, F(1)=1 ; long represente jusqu'a F(92). */
    public static long fibonacciI(int n) {
        if (n < 0 || n > 92) throw new IllegalArgumentException("0 <= n <= 92");
        if (n == 0) return 0;
        long precedent = 0, courant = 1;
        for (int i = 2; i <= n; i++) {
            long suivant = precedent + courant;
            precedent = courant;
            courant = suivant;
        }
        return courant;
    }
    // END fibonacci

    // BEGIN palindrome
    /** Comparaison exacte des unites UTF-16 ; pas de normalisation. */
    public static boolean palindrome(String s) {
        Objects.requireNonNull(s, "s");
        return palindrome(s, 0, s.length() - 1);
    }
    private static boolean palindrome(String s, int g, int d) {
        if (g >= d) return true;
        return s.charAt(g) == s.charAt(d) && palindrome(s, g + 1, d - 1);
    }
    // END palindrome

    // BEGIN sortedrecursive
    /** Croissant au sens large : les valeurs egales sont acceptees. */
    public static boolean estTrie(int[] a) {
        Objects.requireNonNull(a, "a");
        return estTrie(a, 0);
    }
    private static boolean estTrie(int[] a, int i) {
        if (i >= a.length - 1) return true;
        return a[i] <= a[i + 1] && estTrie(a, i + 1);
    }
    // END sortedrecursive

    // BEGIN maxrecursive
    public static int maximumR(int[] a) {
        Objects.requireNonNull(a, "a");
        if (a.length == 0) throw new IllegalArgumentException("tableau vide");
        return maximumR(a, a.length - 1);
    }
    private static int maximumR(int[] a, int i) {
        if (i == 0) return a[0];
        return Math.max(a[i], maximumR(a, i - 1));
    }
    // END maxrecursive

    // BEGIN linearsearch
    /** Premier indice ou -1 ; le tableau n'a pas besoin d'etre trie. */
    public static int rechercheLineaire(int[] a, int cible) {
        Objects.requireNonNull(a, "a");
        for (int i = 0; i < a.length; i++) {
            if (a[i] == cible) return i;
        }
        return -1;
    }
    // END linearsearch

    // BEGIN binarysearch
    /** Precondition : a trie en ordre croissant. Un indice quelconque ou -1. */
    public static int rechercheDichotomique(int[] a, int cible) {
        Objects.requireNonNull(a, "a");
        int gauche = 0, droite = a.length - 1;
        while (gauche <= droite) {
            int milieu = gauche + (droite - gauche) / 2;
            if (a[milieu] == cible) return milieu;
            if (a[milieu] < cible) gauche = milieu + 1;
            else droite = milieu - 1;
        }
        return -1;
    }
    // END binarysearch

    // BEGIN bubble
    public static void triBulle(int[] a) {
        Objects.requireNonNull(a, "a");
        for (int fin = a.length - 1; fin > 0; fin--) {
            boolean echange = false;
            for (int i = 0; i < fin; i++) {
                if (a[i] > a[i + 1]) {
                    int tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp;
                    echange = true;
                }
            }
            if (!echange) return;
        }
    }
    // END bubble

    // BEGIN selection
    public static void triSelection(int[] a) {
        Objects.requireNonNull(a, "a");
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[min]) min = j;
            }
            int tmp = a[i]; a[i] = a[min]; a[min] = tmp;
        }
    }
    // END selection

    // BEGIN insertion
    public static void triInsertion(int[] a) {
        Objects.requireNonNull(a, "a");
        for (int i = 1; i < a.length; i++) {
            int valeur = a[i], j = i - 1;
            while (j >= 0 && a[j] > valeur) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = valeur;
        }
    }
    // END insertion

    // BEGIN merge
    public static void triFusion(int[] a) {
        Objects.requireNonNull(a, "a");
        int[] aide = new int[a.length];
        trier(a, aide, 0, a.length); // intervalles [g,d)
    }
    private static void trier(int[] a, int[] aide, int g, int d) {
        if (d - g < 2) return;
        int m = g + (d - g) / 2;
        trier(a, aide, g, m);
        trier(a, aide, m, d);
        int i = g, j = m, k = g;
        while (i < m && j < d) {
            aide[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        }
        while (i < m) aide[k++] = a[i++];
        while (j < d) aide[k++] = a[j++];
        System.arraycopy(aide, g, a, g, d - g);
    }
    // END merge

    // BEGIN gcd
    /** PGCD >= 0 ; convention pgcd(0,0)=0, valeurs int completes admises. */
    public static long pgcd(int a, int b) {
        long x = Math.abs((long) a), y = Math.abs((long) b);
        while (y != 0) {
            long reste = x % y;
            x = y;
            y = reste;
        }
        return x;
    }
    // END gcd

    // BEGIN luhn
    /** Chiffres ASCII seulement ; chaine vide invalide ; checksum, pas validation commerciale. */
    public static boolean luhn(String s) {
        Objects.requireNonNull(s, "s");
        if (s.isEmpty()) return false;
        int sommeModulo = 0;
        boolean doubler = false;
        for (int i = s.length() - 1; i >= 0; i--) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') return false;
            int n = c - '0';
            if (doubler) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sommeModulo = (sommeModulo + n) % 10;
            doubler = !doubler;
        }
        return sommeModulo == 0;
    }
    // END luhn

    // BEGIN bfs
    /** Grille rectangulaire : 0 libre, autre valeur bloquee ; quatre voisins. */
    public static int distanceBfs(int[][] grille, int sr, int sc, int tr, int tc) {
        Objects.requireNonNull(grille, "grille");
        if (grille.length == 0 || grille[0] == null || grille[0].length == 0)
            throw new IllegalArgumentException("grille vide");
        int lignes = grille.length, colonnes = grille[0].length;
        for (int[] ligne : grille)
            if (ligne == null || ligne.length != colonnes)
                throw new IllegalArgumentException("grille non rectangulaire");
        if (sr<0 || sr>=lignes || sc<0 || sc>=colonnes ||
            tr<0 || tr>=lignes || tc<0 || tc>=colonnes)
            throw new IllegalArgumentException("coordonnees");
        if (grille[sr][sc]!=0 || grille[tr][tc]!=0) return -1;
        int[][] distances = new int[lignes][colonnes];
        for (int[] ligne : distances) Arrays.fill(ligne, -1);
        Deque<int[]> file = new ArrayDeque<>();
        file.offerLast(new int[]{sr,sc});
        distances[sr][sc] = 0; // marquer a l'entree dans la file
        int[] dr={1,-1,0,0}, dc={0,0,1,-1};
        while (!file.isEmpty()) {
            int[] p = file.pollFirst();
            int r=p[0], c=p[1];
            if (r==tr && c==tc) return distances[r][c];
            for (int k=0;k<4;k++) {
                int nr=r+dr[k], nc=c+dc[k];
                if (nr>=0 && nr<lignes && nc>=0 && nc<colonnes &&
                    grille[nr][nc]==0 && distances[nr][nc]==-1) {
                    distances[nr][nc]=distances[r][c]+1;
                    file.offerLast(new int[]{nr,nc});
                }
            }
        }
        return -1;
    }
    // END bfs

    // BEGIN horner
    /** coefficients[i] correspond a x^i ; tableau vide represente 0 ici. */
    public static double horner(double[] coefficients, double x) {
        Objects.requireNonNull(coefficients, "coefficients");
        double resultat = 0;
        for (int i = coefficients.length - 1; i >= 0; i--)
            resultat = resultat * x + coefficients[i];
        return resultat;
    }
    // END horner

    // BEGIN frequency
    /** Ordre de premiere apparition preserve ; mots non null. */
    public static Map<String,Integer> frequences(List<String> mots) {
        Objects.requireNonNull(mots, "mots");
        Map<String,Integer> resultat = new LinkedHashMap<>();
        for (String mot : mots) {
            Objects.requireNonNull(mot, "mot");
            resultat.merge(mot, 1, Integer::sum);
        }
        return resultat;
    }
    // END frequency

    // BEGIN genericfunctional
    public static <T> List<T> filterList(List<T> source, Predicate<? super T> filtre) {
        Objects.requireNonNull(source); Objects.requireNonNull(filtre);
        List<T> resultat = new ArrayList<>();
        for (T x : source) if (filtre.test(x)) resultat.add(x);
        return resultat;
    }
    public static <T,R> List<R> mapList(List<T> source, Function<? super T,? extends R> f) {
        Objects.requireNonNull(source); Objects.requireNonNull(f);
        List<R> resultat = new ArrayList<>();
        for (T x : source) resultat.add(f.apply(x));
        return resultat;
    }
    public static <T> T reduceList(List<T> source, T initial, BinaryOperator<T> op) {
        Objects.requireNonNull(source); Objects.requireNonNull(op);
        T resultat = initial;
        for (T x : source) resultat = op.apply(resultat, x);
        return resultat;
    }
    // END genericfunctional

    // BEGIN benchmark
    /** Petit banc pedagogique ; pas un benchmark de production. */
    public static void comparerTris(int[] original) {
        Objects.requireNonNull(original);
        String[] noms={"bulle","selection","insertion","fusion"};
        List<Consumer<int[]>> tris=List.of(
            RevisionAlgorithms::triBulle, RevisionAlgorithms::triSelection,
            RevisionAlgorithms::triInsertion, RevisionAlgorithms::triFusion);
        int[] attendu=original.clone(); Arrays.sort(attendu);
        for (int i=0;i<tris.size();i++) {
            int[] copie=original.clone(); // copie en dehors de la mesure
            long debut=System.nanoTime();
            tris.get(i).accept(copie);
            long duree=System.nanoTime()-debut;
            if (!Arrays.equals(copie,attendu)) throw new AssertionError(noms[i]);
            System.out.printf("%s : %d ns%n",noms[i],duree);
        }
    }
    // END benchmark
}
