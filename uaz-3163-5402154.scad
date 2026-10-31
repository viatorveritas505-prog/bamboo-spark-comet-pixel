// Заглушка верхнего переднего поручня УАЗ Патриот
// 3163-5402154 / 3163-5402154-00
// Контур снят с фото. На каталожном снимке ~51 × 28 мм.
// Высота корпуса 2.5 мм, лицо — пологий свод, защёлки под 45° к короткой стороне.

length = 51;     // мм, вдоль
width  = 28;     // мм, поперёк
height = 2.5;    // мм, толщина корпуса без защёлок
crown  = 0.9;    // подъём свода над кромкой
round_in = 4.2;  // насколько скругление заходит от кромки, мм
clip_h = 2.6;    // выступ защёлки вниз
rib_h  = 1.15;
rib_t  = 0.9;

$fn = 48;

// Нормализованный контур фото: X вправо (широкий торец), Y вверх.
outline = [
  [-0.4863, 0.0183], [-0.4552, 0.1188], [-0.4121, 0.1984], [-0.3560, 0.2563],
  [-0.3023, 0.3059], [-0.2618, 0.3429], [-0.2258, 0.3783], [-0.2003, 0.4050],
  [-0.1711, 0.4273], [-0.1484, 0.4463], [-0.1210, 0.4560], [-0.0909, 0.4549],
  [-0.0606, 0.4546], [-0.0354, 0.4576], [-0.0114, 0.4606], [ 0.0114, 0.4648],
  [ 0.0335, 0.4625], [ 0.0582, 0.4590], [ 0.0829, 0.4546], [ 0.1106, 0.4546],
  [ 0.1364, 0.4542], [ 0.1667, 0.4577], [ 0.2082, 0.4750], [ 0.2538, 0.4961],
  [ 0.2993, 0.5000], [ 0.3448, 0.4824], [ 0.3892, 0.4388], [ 0.4416, 0.3903],
  [ 0.4798, 0.3411], [ 0.5000, 0.2689], [ 0.4896, 0.1897], [ 0.4641, 0.1019],
  [ 0.4394, 0.0113], [ 0.4230,-0.0818], [ 0.4188,-0.1620], [ 0.4134,-0.2379],
  [ 0.3996,-0.2963], [ 0.3770,-0.3552], [ 0.3498,-0.4050], [ 0.3165,-0.4454],
  [ 0.2807,-0.4764], [ 0.2430,-0.4934], [ 0.2054,-0.5000], [ 0.1683,-0.4994],
  [ 0.1350,-0.4949], [ 0.1011,-0.4811], [ 0.0743,-0.4731], [ 0.0456,-0.4648],
  [ 0.0200,-0.4666], [-0.0059,-0.4616], [-0.0339,-0.4560], [-0.0591,-0.4494],
  [-0.0869,-0.4417], [-0.1145,-0.4329], [-0.1439,-0.4232], [-0.1731,-0.4129],
  [-0.2129,-0.4027], [-0.2621,-0.3912], [-0.3225,-0.3731], [-0.3787,-0.3370],
  [-0.4339,-0.2847], [-0.4741,-0.2189], [-0.4987,-0.1489], [-0.5000,-0.0675]
];

function smooth(u) = u * u * (3 - 2 * u);
function ease(u) = 0.4 * u + 0.6 * smooth(u);

module shell() {
  scale([length, width]) polygon(outline);
}

module section(inset) {
  offset(delta = -inset) shell();
}

// Лицо: стенка + набор оболочек, высота растёт плавно к середине.
module body() {
  wall = height - crown;
  steps = 20;
  linear_extrude(wall) shell();
  for (i = [0 : steps - 1]) {
    t0 = i / steps;
    t1 = (i + 1) / steps;
    hull() {
      translate([0, 0, wall + crown * ease(t0)])
        linear_extrude(0.02) section(max(0.04, round_in * ease(t0)));
      translate([0, 0, wall + crown * ease(t1)])
        linear_extrude(0.02) section(max(0.04, round_in * ease(t1)));
    }
  }
}

module rib_box(sx, sy, sz, x, y) {
  translate([x, y, -sz / 2 + 0.12])
    cube([sx, sy, sz], center = true);
}

module spoke(x1, y1, x2, y2) {
  dx = x2 - x1;
  dy = y2 - y1;
  ang = atan2(dy, dx);
  len = norm([dx, dy]) + rib_t;
  translate([(x1 + x2) / 2, (y1 + y2) / 2, 0])
    rotate([0, 0, ang])
      rib_box(len, rib_t, rib_h, 0, 0);
}

// Рамка и спицы, без центральной крестовины.
module ribs() {
  fx = length * 0.20;
  fy = width * 0.24;
  reach = min(length, width) * 0.16;
  rib_box(fx * 2 + rib_t, rib_t, rib_h, 0, fy);
  rib_box(fx * 2 + rib_t, rib_t, rib_h, 0, -fy);
  rib_box(rib_t, fy * 2 + rib_t, rib_h, -fx, 0);
  rib_box(rib_t, fy * 2 + rib_t, rib_h, fx, 0);
  rib_box(rib_t, reach, rib_h, 0, fy + reach / 2);
  rib_box(rib_t, reach, rib_h, 0, -(fy + reach / 2));
  rib_box(reach, rib_t, rib_h, fx + reach / 2, 0);
  rib_box(reach, rib_t, rib_h, -(fx + reach / 2), 0);
  spoke(-fx, fy, -fx - reach * 0.85, fy + reach * 0.70);
  spoke( fx, fy,  fx + reach * 0.80, fy + reach * 0.72);
  spoke(-fx, -fy, -fx - reach * 0.80, -fy - reach * 0.62);
  spoke( fx, -fy,  fx + reach * 0.72, -fy - reach * 0.62);
}

module marks() {
  for (p = [
    [-0.16,  0.20, 1.15],
    [-0.10, -0.22, 1.30],
    [ 0.22,  0.18, 1.05],
    [ 0.16, -0.20, 1.20]
  ])
    translate([p[0] * length, p[1] * width, -0.05])
      cylinder(h = 0.45, r1 = p[2], r2 = p[2] * 0.72);
}

// Прямоугольная защёлка с окном и крючком. Длинная ось — X.
module clip() {
  along = 5.4;
  beam = 2.3;
  difference() {
    union() {
      cube([along, beam * 0.72, clip_h], center = true);
      translate([0, beam * 0.36, -clip_h * 0.22])
        cube([along * 0.92, beam * 0.42, clip_h * 0.36], center = true);
    }
    translate([0, beam * 0.05, -clip_h * 0.12])
      cube([along * 0.46, beam * 1.6, clip_h * 0.40], center = true);
  }
}

module clips() {
  // Нижняя, у левого ребра, 45° к короткой стороне.
  translate([-0.30 * length, -0.3798 * width, -clip_h * 0.15])
    rotate([0, 0, 135])
      clip();
  // Верхняя, у правого широкого торца.
  translate([0.34 * length, 0.4843 * width, -clip_h * 0.15])
    rotate([0, 0, -45])
      clip();
}

module plug() {
  difference() {
    union() {
      body();
      ribs();
      clips();
    }
    marks();
  }
}

plug();
