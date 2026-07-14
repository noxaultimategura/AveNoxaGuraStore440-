package Noxa;

public class Tabung {
    private double jariJari;
    private double tinggi;

    public Tabung() {
        this.jariJari = -2;
        this.tinggi = 5;
    }

    public Tabung(double jariJari, double tinggi) {
        if (jariJari < 0) {
            this.jariJari = 1;
        } else {
            this.jariJari = jariJari;
        }

        if (tinggi < 0) {
            this.tinggi = 1;
        } else {
            this.tinggi = tinggi;
        }
    }

    public double getJariJari() {
        return this.jariJari;
    }

    public double getTinggi() {
        return this.tinggi;
    }

    public double getVolume() {
        return Math.PI * getJariJari() * getJariJari() * getTinggi();
    }

    public double getLuasPermukaan() {
        return 2 * Math.PI * getJariJari() * (getJariJari() + getTinggi());
    }

    public static void main(String[] args) {
        Tabung tabung = new Tabung(14, 100);
        System.out.println("Jari-jari      : " + tabung.getJariJari());
        System.out.println("Tinggi         : " + tabung.getTinggi());
        System.out.println("Volume         : " + tabung.getVolume());
        System.out.println("Luas Permukaan : " + tabung.getLuasPermukaan());
    }
}

