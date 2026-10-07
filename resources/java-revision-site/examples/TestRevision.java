import java.util.*;
import java.util.function.*;
import java.util.stream.*;

/** Tests autonomes : lancer avec Java 21. Pas de bibliotheque de test externe. */
public final class TestRevision {
    private static int checks=0;
    private TestRevision() { }
    private static void check(boolean ok,String label) {
        checks++;
        if (!ok) throw new AssertionError(label);
    }
    private static void eq(Object actual,Object expected,String label) {
        check(Objects.equals(actual,expected),label+": actual="+actual+", expected="+expected);
    }
    private static void expect(Class<? extends Throwable> type,Runnable r,String label) {
        checks++;
        try { r.run(); } catch (Throwable t) {
            if (type.isInstance(t)) return;
            throw new AssertionError(label+": wrong exception "+t,t);
        }
        throw new AssertionError(label+": missing exception "+type.getSimpleName());
    }
    public static void main(String[] args) {
        check(RevisionAlgorithms.estDiviseur(12,3),"divisor");
        check(!RevisionAlgorithms.estDiviseur(12,0),"zero divisor");
        check(RevisionAlgorithms.estDiviseur(0,-2),"zero dividend");
        check(RevisionAlgorithms.estDiviseur(Integer.MIN_VALUE,-1),"min remainder");
        String[] grades={"Concepteur","Ingénieur","Développeur"};
        int[][] salaries={{15,17,19},{23,25,27},{35,40,45}};
        for(int i=0;i<3;i++) for(int j=0;j<3;j++)
            eq(RevisionAlgorithms.calculSalaire(grades[i],j+1),(double)salaries[i][j],"salary");
        eq(RevisionAlgorithms.calculSalaire(null,1),0.0,"salary null");
        eq(RevisionAlgorithms.calculSalaire("bad",2),0.0,"salary unknown");
        eq(RevisionAlgorithms.calculSalaire("Concepteur",4),0.0,"salary range");
        for(int n=0;n<1000;n++) {
            int sum=0;
            for(int d=1;d<n;d++) if(n%d==0) sum+=d;
            check(RevisionAlgorithms.estParfait(n)==(n>0 && sum==n),"perfect "+n);
        }
        check(RevisionAlgorithms.estParfait(8128),"perfect 8128");
        check(!RevisionAlgorithms.estParfait(-6),"perfect negative");
        eq(RevisionAlgorithms.parfaits(-5,500),List.of(6,28,496),"perfect range");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.parfaits(5,4),"bad range");
        check(!RevisionAlgorithms.uneMajusculeAscii(""),"uppercase empty");
        check(RevisionAlgorithms.uneMajusculeAscii("abZ"),"uppercase end");
        check(!RevisionAlgorithms.uneMajusculeAscii("Été"),"ASCII only");
        check(RevisionAlgorithms.uneMajusculeUnicode("Été"),"unicode uppercase");
        expect(NullPointerException.class,()->RevisionAlgorithms.uneMajusculeAscii(null),"uppercase null");
        int[] random=RevisionAlgorithms.tableauAleatoire(300,-9,9,new Random(5));
        for(int x:random) check(x>=-9 && x<=9,"random interval");
        check(Arrays.equals(random,RevisionAlgorithms.tableauAleatoire(300,-9,9,new Random(5))),"repeatable random");
        eq(RevisionAlgorithms.tableauAleatoire(0,0,0,new Random(1)).length,0,"random empty");
        int[] fullRange=RevisionAlgorithms.tableauAleatoire(100,Integer.MIN_VALUE,Integer.MAX_VALUE,new Random(1));
        eq(fullRange.length,100,"full range accepted");
        check(Arrays.stream(fullRange).anyMatch(x->x<0) && Arrays.stream(fullRange).anyMatch(x->x>=0),"full range covers both signs for fixed seed");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.tableauAleatoire(-1,0,1,new Random()),"negative size");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.tableauAleatoire(1,2,1,new Random()),"reversed bounds");
        eq(RevisionAlgorithms.decrire(new int[]{}),"[]","describe empty");
        eq(RevisionAlgorithms.decrire(new int[]{-1,2}),"[-1, 2]","describe");
        for(int n=0;n<=100;n++) {
            long expected=(long)n*(n+1)/2;
            eq(RevisionAlgorithms.sommeI(n),expected,"sum iterative");
            eq(RevisionAlgorithms.sommeR(n),expected,"sum recursive");
            eq(RevisionAlgorithms.sommeFormule(n),expected,"sum formula");
        }
        eq(RevisionAlgorithms.sommeFormule(Integer.MAX_VALUE),2305843008139952128L,"sum int max");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.sommeR(-1),"sum negative");
        for(int n=0;n<22;n++) eq(RevisionAlgorithms.fibonacciR(n),RevisionAlgorithms.fibonacciI(n),"fib parity "+n);
        eq(RevisionAlgorithms.fibonacciI(92),7540113804746346429L,"fib 92");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.fibonacciI(93),"fib overflow prevented");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.fibonacciR(36),"fib costly input prevented");
        for(String s:List.of("","x","aba","abba","été")) check(RevisionAlgorithms.palindrome(s),"palindrome "+s);
        check(!RevisionAlgorithms.palindrome("Abba"),"case-sensitive palindrome");
        check(RevisionAlgorithms.estTrie(new int[]{}),"sorted empty");
        check(RevisionAlgorithms.estTrie(new int[]{-3,-3,0}),"sorted duplicate");
        check(!RevisionAlgorithms.estTrie(new int[]{1,0}),"unsorted");
        eq(RevisionAlgorithms.maximumR(new int[]{-7,-2,-5}),-2,"maximum all negative");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.maximumR(new int[]{}),"maximum empty");
        eq(RevisionAlgorithms.rechercheLineaire(new int[]{2,1,2},2),0,"first match");
        eq(RevisionAlgorithms.rechercheLineaire(new int[]{},1),-1,"search empty");
        List<Consumer<int[]>> sorts=List.of(RevisionAlgorithms::triBulle,RevisionAlgorithms::triSelection,RevisionAlgorithms::triInsertion,RevisionAlgorithms::triFusion);
        Random rng=new Random(87);
        for(int trial=0;trial<150;trial++) {
            int[] a=new int[trial%61];
            for(int i=0;i<a.length;i++) a[i]=rng.nextInt(101)-50;
            if(a.length>1) { a[0]=Integer.MIN_VALUE; a[1]=Integer.MAX_VALUE; }
            int[] sorted=a.clone(); Arrays.sort(sorted);
            for(Consumer<int[]> sort:sorts) {
                int[] copy=a.clone(); sort.accept(copy);
                check(Arrays.equals(copy,sorted),"sort "+trial);
            }
            for(int value=-52;value<=52;value+=13) {
                int index=RevisionAlgorithms.rechercheDichotomique(sorted,value);
                int oracle=Arrays.binarySearch(sorted,value);
                check(index<0 ? oracle<0 : index<sorted.length && sorted[index]==value,"binary search");
            }
        }
        for(Consumer<int[]> sort:sorts) expect(NullPointerException.class,()->sort.accept(null),"sort null");
        eq(RevisionAlgorithms.pgcd(-54,24),6L,"gcd signs");
        eq(RevisionAlgorithms.pgcd(0,0),0L,"gcd zeros");
        eq(RevisionAlgorithms.pgcd(Integer.MIN_VALUE,0),2147483648L,"gcd min");
        check(RevisionAlgorithms.luhn("79927398713"),"luhn valid");
        check(!RevisionAlgorithms.luhn("79927398714"),"luhn invalid");
        check(!RevisionAlgorithms.luhn(""),"luhn empty");
        check(!RevisionAlgorithms.luhn("12x"),"luhn non-digit");
        check(!RevisionAlgorithms.luhn("１２"),"luhn non-ASCII");
        int[][] grid={{0,1,0},{0,0,0},{1,1,0}};
        eq(RevisionAlgorithms.distanceBfs(grid,0,0,2,2),4,"bfs detour");
        eq(RevisionAlgorithms.distanceBfs(grid,0,0,0,0),0,"bfs same");
        eq(RevisionAlgorithms.distanceBfs(grid,0,0,0,1),-1,"bfs blocked");
        eq(RevisionAlgorithms.distanceBfs(new int[][]{{0,1,0}},0,0,0,2),-1,"bfs unreachable");
        expect(IllegalArgumentException.class,()->RevisionAlgorithms.distanceBfs(new int[][]{{0},{0,1}},0,0,0,0),"bfs ragged");
        eq(RevisionAlgorithms.horner(new double[]{1,2,3},2),17.0,"horner");
        eq(RevisionAlgorithms.horner(new double[]{},4),0.0,"horner empty");
        var frequencies=RevisionAlgorithms.frequences(List.of("b","a","b"));
        eq(frequencies,Map.of("b",2,"a",1),"frequency values");
        eq(new ArrayList<>(frequencies.keySet()),List.of("b","a"),"frequency order");
        eq(RevisionAlgorithms.filterList(List.of(1,2,3),x->x>1),List.of(2,3),"generic filter");
        eq(RevisionAlgorithms.mapList(List.of("a","bb"),String::length),List.of(1,2),"generic map");
        eq(RevisionAlgorithms.reduceList(List.of(1,2,3),0,Integer::sum),6,"generic reduce");
        eq(RevisionAlgorithms.reduceList(List.<Integer>of(),0,Integer::sum),0,"generic reduce empty");
        var pair=new Modeles.Paire<>(1,2); pair.setFirst(3); pair.setSecond(4);
        eq(pair.getFirst(),3,"pair first"); eq(pair.getSecond(),4,"pair second");
        var tuple=new Modeles.Tuple<>("x",pair); eq(tuple.getSecond().getFirst(),3,"nested generics");
        var linked=new Modeles.ListeChainee<Integer>();
        eq(linked.toString(),"{}","linked empty string");
        expect(NoSuchElementException.class,linked::removeFirst,"linked empty removal");
        linked.addLast(1); linked.addFirst(null); linked.addLast(2);
        eq(linked.toString(),"{null,1,2}","linked null and order");
        check(linked.contains(null),"linked contains null");
        eq(linked.removeFirst(),null,"linked remove null");
        eq(linked.removeFirst(),1,"linked remove first");
        eq(linked.removeFirst(),2,"linked remove last");
        eq(linked.size(),0,"linked empty size");
        linked.addLast(9); eq(linked.removeFirst(),9,"linked reuse empty");
        var doubleList=new Modeles.ListeDouble<Integer>();
        var oracle=new LinkedList<Integer>();
        for(int n=0;n<600;n++) {
            int op=rng.nextInt(4);
            if(op==0) { doubleList.addFirst(n); oracle.addFirst(n); }
            else if(op==1) { doubleList.addLast(n); oracle.addLast(n); }
            else if(!oracle.isEmpty() && op==2) eq(doubleList.removeFirst(),oracle.removeFirst(),"double first");
            else if(!oracle.isEmpty()) eq(doubleList.removeLast(),oracle.removeLast(),"double last");
            eq(doubleList.size(),oracle.size(),"double size");
            eq(doubleList.toString(),"{"+oracle.stream().map(String::valueOf).collect(Collectors.joining(","))+"}","double order");
        }
        while(!oracle.isEmpty()) eq(doubleList.removeFirst(),oracle.removeFirst(),"double drain");
        expect(NoSuchElementException.class,doubleList::removeLast,"double empty remove");
        doubleList.addFirst(null); eq(doubleList.removeLast(),null,"double null");
        double[] notes={10,20};
        var student=new Modeles.Etudiant("Nom","Prenom",20,"x@y",notes);
        notes[0]=0; eq(student.getNotes()[0],10.0,"student input copy");
        double[] exposed=student.getNotes(); exposed[0]=0;
        eq(student.getNotes()[0],10.0,"student output copy");
        eq(student.moyenne().orElseThrow(),15.0,"student mean");
        student.setNote(0,12); eq(student.moyenne().orElseThrow(),16.0,"student set note");
        expect(IllegalArgumentException.class,()->student.setNote(0,Double.NaN),"student nan");
        expect(IndexOutOfBoundsException.class,()->student.setNote(2,10),"student index");
        check(new Modeles.Etudiant("a","b",0,"",new double[]{}).moyenne().isEmpty(),"student empty mean");
        var p1=new Modeles.Polynome(1,2); var p2=new Modeles.Polynome(1,2,0,-0.0);
        check(p1.equals(p2) && p2.equals(p1),"polynomial normalized equality");
        eq(p1.hashCode(),p2.hashCode(),"polynomial hash");
        check(new Modeles.Polynome().equals(new Modeles.Polynome(-0.0,0)) ,"polynomial zero");
        check(!p1.equals(null) && !p1.equals("x"),"polynomial type");
        eq(p1.evaluer(3),7.0,"polynomial eval");
        p1.getCoefficients()[0]=100; eq(p1.evaluer(3),7.0,"polynomial defensive");
        eq(new HashSet<>(List.of(p1,p2)).size(),1,"polynomial hash set");
        expect(IllegalArgumentException.class,()->new Modeles.Polynome(Double.POSITIVE_INFINITY),"polynomial infinity");
        Modeles.Forme shape=new Modeles.Carre(3); eq(shape.aire(),9.0,"polymorphism");
        eq(shape.getNom(),"Carre","inherited method");
        expect(IllegalArgumentException.class,()->new Modeles.Carre(-1),"shape validation");
        Function<Integer,Integer> f=x->x+1,g=x->x*2;
        eq(f.andThen(g).apply(3),8,"andThen"); eq(f.compose(g).apply(3),7,"compose");
        check(Stream.<Integer>empty().allMatch(x->x>0),"allMatch empty");
        check(!Stream.<Integer>empty().anyMatch(x->x>0),"anyMatch empty");
        eq(Stream.of(1,2,3,4).filter(x->x%2==0).map(x->x*10).toList(),List.of(20,40),"stream pipeline");
        expect(UnsupportedOperationException.class,()->Stream.of(1,2).toList().add(3),"stream immutable");
        expect(IllegalStateException.class,()->Stream.of("a","b").collect(Collectors.toMap(String::length,x->x)),"toMap duplicate");
        var once=Stream.of(1,2,3); eq(once.count(),3L,"count");
        expect(IllegalStateException.class,once::count,"stream reuse");
        eq("a12b".replaceAll("\\d+","#"),"a#b","regex escaping");
        RevisionAlgorithms.comparerTris(new int[]{3,1,2,0});
        System.out.println("PASS: "+checks+" checks; Java "+System.getProperty("java.version"));
        System.out.println("Scope: full example files and selected language/API cases. Not a proof or exhaustive verification of every teaching fragment.");
    }
}
