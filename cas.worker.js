const scope = self;
let handler = null;
let booting = null;
const boot = async (base, cdn) => {
    const index = cdn || `${base}/pyodide/`;
    scope.postMessage({ boot: 'runtime', detail: 'import' });
    const runtime = (await import(/* webpackIgnore: true */ `${index}pyodide.mjs`));
    scope.postMessage({ boot: 'runtime', detail: 'wasm' });
    const py = await runtime.loadPyodide({ indexURL: index });
    scope.postMessage({ boot: 'packages' });
    const manifest = (await (await fetch(`${base}/py/manifest.json`, { cache: 'no-cache' })).json());
    const site = String(py.runPython('import site; site.getsitepackages()[0]'));
    if (cdn) {
        await py.loadPackage(['sympy']);
    }
    else {
        const wheels = await Promise.all(manifest.wheels.map(async (w) => (await fetch(`${base}/py/wheels/${w}`)).arrayBuffer()));
        for (const buffer of wheels)
            py.unpackArchive(buffer, 'wheel', { extractDir: site });
    }
    scope.postMessage({ boot: 'engine' });
    py.FS.mkdirTree(`${site}/ticas`);
    for (const [name, source] of Object.entries(manifest.sources))
        py.FS.writeFile(`${site}/ticas/${name}`, source);
    const api = py.pyimport('ticas.api');
    handler = (request) => String(api.handle(request));
    scope.postMessage({ boot: 'ready' });
};
scope.onmessage = (event) => {
    const { id, op, payload, base, cdn } = event.data;
    if (!booting) {
        booting = boot(base ?? '', cdn ?? '').catch((error) => {
            scope.postMessage({ boot: 'error', detail: error instanceof Error ? error.message : String(error) });
            throw error;
        });
    }
    booting
        .then(() => {
        if (op === 'boot') {
            scope.postMessage({ id, result: { ok: true } });
            return;
        }
        if (!handler)
            throw new Error('CAS engine unavailable');
        const raw = handler(JSON.stringify({ op, ...payload }));
        scope.postMessage({ id, result: JSON.parse(raw) });
    })
        .catch((error) => {
        scope.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
    });
};
export {};
