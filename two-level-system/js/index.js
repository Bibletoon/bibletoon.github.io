let OmegaR, t, dt, c1_0, c2_0, c1,
    c2, gamma, delta, t_values, probability_1, probability_2, iterationsCount;
let flag = false;

Plotly.newPlot('plot', [{
        x : [0],
        y : [0],
        mode: 'lines',
        name: 'Probability 1',
        line: {color: '#80CAF6'}
    },
    {
        x : [0],
        y : [0],
        mode: 'lines',
        name: 'Probability 2',
        line: {color: '#BF151F'}
    },])

function calculateValues() {
    t += dt;
    let dc1 = math.divide(
        math.sum(
            math.multiply(
                math.complex(-OmegaR, 0),
                c2,
                math.exp(
                    math.complex(
                        0,
                        math.multiply(
                            t, delta
                        )
                    )
                )
            ),
            math.multiply(
                c1,
                math.complex(0, -gamma/2)
            )
        ),
        math.complex(0, 1)
    );

    let dc2 = math.divide(
        math.sum(
            math.multiply(
                math.complex(-OmegaR, 0),
                c1,
                math.exp(
                    math.complex(
                        0,
                        math.multiply(
                            -t, delta
                        )
                    )
                )
            ),
            math.multiply(
                c2,
                math.complex(0, -gamma/2)
            )
        ),
        math.complex(0, 1)
    );

    c1 = math.sum(c1, math.multiply(dc1, math.complex(dt, 0)));
    c2 = math.sum(c2, math.multiply(dc2, math.complex(dt, 0)));
}

function initializeValues() {
    iterationsCount = 0;
    t = 0;
    t_values = [];
    probability_1 = [];
    probability_2 = [];

    dt = parseFloat(document.getElementById("dt").value);
    c1_0 = math.sqrt(parseFloat(document.getElementById("c1").value));
    c2_0 = math.sqrt(parseFloat(document.getElementById("c2").value));
    gamma = parseFloat(document.getElementById("gamma").value);

    delta = parseFloat(document.getElementById("delta").value);

    c1 = math.complex(c1_0, 0);
    c2 = math.complex(c2_0, 0);

    OmegaR = parseFloat(document.getElementById("omega_r").value);
}

function render() {
    t_values.push(t);
    probability_1.push(math.multiply(c1, c1.conjugate()).re);
    probability_2.push(math.multiply(c2, c2.conjugate()).re);
    Plotly.update('plot', {
        x: [t_values],
        y : [probability_1]
    }, {}, 0);

    Plotly.update('plot', {
        x: [t_values],
        y: [probability_2]
    }, {}, 1);
}

function iteration() {
    for (let i=0;i<200;i++) {
        calculateValues();
    }
    render();


    iterationsCount+=1;
    if (flag) {
        setTimeout(() => {iteration()}, 0);
    }
}

function start() {
    initializeValues();
    flag = true;
    setTimeout(() => {iteration()}, 0.1);
}

function stop() {
    flag = false;
}