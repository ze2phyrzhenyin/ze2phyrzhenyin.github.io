import java.util.*;

/** Exemples de classes complets ; classes imbriquees pour compiler un seul fichier. */
public final class Modeles {
    private Modeles() { }

    // BEGIN pairtuple
    public static final class Paire<T> {
        private T first, second;
        public Paire(T first, T second) { this.first=first; this.second=second; }
        public T getFirst() { return first; }
        public T getSecond() { return second; }
        public void setFirst(T value) { first=value; }
        public void setSecond(T value) { second=value; }
    }
    public static final class Tuple<T,U> {
        private final T first;
        private final U second;
        public Tuple(T first, U second) { this.first=first; this.second=second; }
        public T getFirst() { return first; }
        public U getSecond() { return second; }
    }
    // END pairtuple

    // BEGIN singly
    /** Valeurs null admises ; suppression a vide => NoSuchElementException. */
    public static final class ListeChainee<T> {
        private static final class Element<E> {
            final E valeur;
            Element<E> suivant;
            Element(E valeur) { this.valeur=valeur; }
        }
        private Element<T> tete, queue;
        private int taille;
        public boolean isEmpty() { return tete==null; }
        public int size() { return taille; }
        public void addLast(T valeur) {
            Element<T> e=new Element<>(valeur);
            if (isEmpty()) tete=e;
            else queue.suivant=e;
            queue=e;
            taille++;
        }
        public void addFirst(T valeur) {
            Element<T> e=new Element<>(valeur);
            e.suivant=tete;
            tete=e;
            if (queue==null) queue=e;
            taille++;
        }
        public T removeFirst() {
            if (isEmpty()) throw new NoSuchElementException("liste vide");
            T valeur=tete.valeur;
            tete=tete.suivant;
            if (tete==null) queue=null;
            taille--;
            return valeur;
        }
        public boolean contains(T valeur) {
            for (Element<T> e=tete;e!=null;e=e.suivant)
                if (Objects.equals(e.valeur,valeur)) return true;
            return false;
        }
        @Override public String toString() {
            StringJoiner j=new StringJoiner(",","{","}");
            for (Element<T> e=tete;e!=null;e=e.suivant)
                j.add(String.valueOf(e.valeur));
            return j.toString();
        }
    }
    // END singly

    // BEGIN doubly
    public static final class ListeDouble<T> {
        private static final class Noeud<E> {
            final E valeur;
            Noeud<E> precedent, suivant;
            Noeud(E valeur) { this.valeur=valeur; }
        }
        private Noeud<T> tete, queue;
        private int taille;
        public int size() { return taille; }
        public boolean isEmpty() { return taille==0; }
        public void addLast(T valeur) {
            Noeud<T> e=new Noeud<>(valeur);
            e.precedent=queue;
            if (queue==null) tete=e;
            else queue.suivant=e;
            queue=e;
            taille++;
        }
        public void addFirst(T valeur) {
            Noeud<T> e=new Noeud<>(valeur);
            e.suivant=tete;
            if (tete==null) queue=e;
            else tete.precedent=e;
            tete=e;
            taille++;
        }
        public T removeFirst() {
            if (isEmpty()) throw new NoSuchElementException("liste vide");
            T v=tete.valeur;
            tete=tete.suivant;
            if (tete==null) queue=null;
            else tete.precedent=null;
            taille--;
            return v;
        }
        public T removeLast() {
            if (isEmpty()) throw new NoSuchElementException("liste vide");
            T v=queue.valeur;
            queue=queue.precedent;
            if (queue==null) tete=null;
            else queue.suivant=null;
            taille--;
            return v;
        }
        @Override public String toString() {
            StringJoiner j=new StringJoiner(",","{","}");
            for (Noeud<T> e=tete;e!=null;e=e.suivant)
                j.add(String.valueOf(e.valeur));
            return j.toString();
        }
    }
    // END doubly

    // BEGIN studentmodel
    public static final class Etudiant {
        private String nom, prenom, email;
        private int age;
        private final double[] notes;
        public Etudiant(String nom, String prenom, int age, String email, double[] notes) {
            setNom(nom); setPrenom(prenom); setAge(age); setEmail(email);
            Objects.requireNonNull(notes,"notes");
            this.notes=Arrays.copyOf(notes,notes.length);
            for (double n:this.notes) verifierNote(n);
        }
        private static void verifierNote(double n) {
            if (!Double.isFinite(n) || n<0 || n>20)
                throw new IllegalArgumentException("note hors [0,20]");
        }
        public String getNom() { return nom; }
        public String getPrenom() { return prenom; }
        public int getAge() { return age; }
        public String getEmail() { return email; }
        public double[] getNotes() { return Arrays.copyOf(notes,notes.length); }
        public void setNom(String v) { nom=Objects.requireNonNull(v); }
        public void setPrenom(String v) { prenom=Objects.requireNonNull(v); }
        public void setAge(int v) {
            if (v<0) throw new IllegalArgumentException("age < 0");
            age=v;
        }
        /** Seulement non null ; pas de validation complete d'adresse email. */
        public void setEmail(String v) { email=Objects.requireNonNull(v); }
        public void setNote(int index,double n) {
            Objects.checkIndex(index,notes.length);
            verifierNote(n);
            notes[index]=n;
        }
        public OptionalDouble moyenne() {
            return Arrays.stream(notes).average();
        }
        @Override public String toString() {
            return prenom+" "+nom+" "+Arrays.toString(notes);
        }
    }
    // END studentmodel

    // BEGIN polynomialmodel
    /** Coefficients finis ; c[i] = coefficient de x^i ; egalite exacte normalisee. */
    public static final class Polynome {
        private final double[] coefficients;
        public Polynome(double... valeurs) {
            Objects.requireNonNull(valeurs,"coefficients");
            double[] c=Arrays.copyOf(valeurs,Math.max(1,valeurs.length));
            for (int i=0;i<c.length;i++) {
                if (!Double.isFinite(c[i])) throw new IllegalArgumentException("non fini");
                if (c[i]==0.0) c[i]=0.0; // -0.0 => +0.0
            }
            int n=c.length;
            while (n>1 && c[n-1]==0.0) n--;
            coefficients=Arrays.copyOf(c,n);
        }
        public double[] getCoefficients() { return coefficients.clone(); }
        public double evaluer(double x) {
            return RevisionAlgorithms.horner(coefficients,x);
        }
        @Override public boolean equals(Object o) {
            if (this==o) return true;
            if (!(o instanceof Polynome p)) return false;
            return Arrays.equals(coefficients,p.coefficients);
        }
        @Override public int hashCode() { return Arrays.hashCode(coefficients); }
        @Override public String toString() { return Arrays.toString(coefficients); }
    }
    // END polynomialmodel

    // BEGIN inheritanceexample
    public interface Mesurable { double aire(); }
    public abstract static class Forme implements Mesurable {
        private final String nom;
        protected Forme(String nom) { this.nom=Objects.requireNonNull(nom); }
        public final String getNom() { return nom; }
        @Override public String toString() { return nom+"="+aire(); }
    }
    public static final class Carre extends Forme {
        private final double cote;
        public Carre(double cote) {
            super("Carre");
            if (!Double.isFinite(cote) || cote<0) throw new IllegalArgumentException("cote");
            this.cote=cote;
        }
        @Override public double aire() { return cote*cote; }
    }
    // END inheritanceexample
}
