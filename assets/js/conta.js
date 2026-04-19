(function () {
    const STORAGE_KEY = 'ufsmDigitalConta';
    const LEGACY_PHOTO_KEY = 'fotoPerfilUsuario';
    const LEGACY_MATRICULA_KEY = 'matriculaUsuario';

    const DEFAULT_DATA = {
        nome: 'Pedro Ruiz Sangoi',
        foto: '',
        dataNascimento: '2002-07-05',
        cpf: '04491974098',
        rg: '6122921304',
        matricula: '202320652'
    };

    function somenteDigitos(valor) {
        return String(valor || '').replace(/\D/g, '');
    }

    function limitarTexto(valor, tamanhoMaximo) {
        return String(valor || '').trim().slice(0, tamanhoMaximo);
    }

    function formatarCPF(valor) {
        const digitos = somenteDigitos(valor).slice(0, 11);

        if (digitos.length <= 3) return digitos;
        if (digitos.length <= 6) return digitos.replace(/(\d{3})(\d+)/, '$1.$2');
        if (digitos.length <= 9) return digitos.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');

        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    function formatarDataExibicao(valor) {
        if (!valor) return '--/--/----';

        const [ano, mes, dia] = String(valor).split('-');
        if (!ano || !mes || !dia) return '--/--/----';

        return `${dia}/${mes}/${ano}`;
    }

    function normalizarDados(dados = {}) {
        const atual = {
            ...DEFAULT_DATA,
            ...dados
        };

        return {
            nome: limitarTexto(atual.nome || DEFAULT_DATA.nome, 80) || DEFAULT_DATA.nome,
            foto: String(atual.foto || ''),
            dataNascimento: String(atual.dataNascimento || DEFAULT_DATA.dataNascimento),
            cpf: somenteDigitos(atual.cpf).slice(0, 11) || DEFAULT_DATA.cpf,
            rg: limitarTexto(atual.rg || DEFAULT_DATA.rg, 20) || DEFAULT_DATA.rg,
            matricula: somenteDigitos(atual.matricula).slice(0, 12) || DEFAULT_DATA.matricula
        };
    }

    function lerDadosSalvos() {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function obterDados() {
        const legadoFoto = localStorage.getItem(LEGACY_PHOTO_KEY) || '';
        const legadoMatricula = localStorage.getItem(LEGACY_MATRICULA_KEY) || '';
        const dadosSalvos = lerDadosSalvos() || {};

        return normalizarDados({
            ...dadosSalvos,
            foto: dadosSalvos.foto || legadoFoto || DEFAULT_DATA.foto,
            matricula: dadosSalvos.matricula || legadoMatricula || DEFAULT_DATA.matricula
        });
    }

    function persistirLegado(dados) {
        localStorage.setItem(LEGACY_PHOTO_KEY, dados.foto || '');
        localStorage.setItem(LEGACY_MATRICULA_KEY, dados.matricula || '');
    }

    function salvarDados(parcial = {}) {
        const atual = obterDados();
        const dados = normalizarDados({
            ...atual,
            ...parcial
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        persistirLegado(dados);

        return dados;
    }

    function garantirDadosIniciais() {
        const dados = obterDados();

        if (!lerDadosSalvos()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        }

        persistirLegado(dados);
        return dados;
    }

    window.UFSMDigitalConta = {
        STORAGE_KEY,
        DEFAULT_DATA,
        ensure: garantirDadosIniciais,
        getData: obterDados,
        saveData: salvarDados,
        formatCPF: formatarCPF,
        formatDateDisplay: formatarDataExibicao,
        digitsOnly: somenteDigitos
    };
})();
