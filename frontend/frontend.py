import streamlit as st
import requests
import pandas as pd
import json

st.set_page_config(page_title="LLM Data Generator", layout="wide")

st.title("LLM Synthetic Data Generator")
st.markdown("Stwórz inteligentny zbiór danych testowych przy użyciu AI.")

with st.sidebar:
    st.header("1. Konfiguracja")
    job_name = st.text_input("Nazwa zbioru danych", value="Mój Zbiór Danych")
    rows_count = st.number_input("Liczba wierszy", min_value=1, max_value=50, value=5)
    global_context = st.text_area("Globalny kontekst (opcjonalnie)", 
                                  value="Sklep internetowy z elektroniką.",
                                  help="Opisz, czego dotyczą dane. LLM będzie o tym wiedział.")
    output_format = st.selectbox("Format wyjściowy", ["json", "csv", "sql"])

if "schema_fields" not in st.session_state:
    st.session_state.schema_fields = []

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("2. Dodaj pola do schematu")
    
    with st.container(border=True):
        field_name = st.text_input("Nazwa pola (np. email, opis)", key="new_field_name")
        field_type = st.selectbox("Typ generatora", ["faker", "llm", "distribution"], key="new_field_type")
        
        params = {}
        dependencies = []

        if field_type == "faker":
            st.info("Generuje proste, losowe dane (szybkie).")
            faker_method = st.selectbox("Metoda Fakera", 
                                      ["name", "email", "address", "city", "country", 
                                       "uuid4", "job", "company", "phone_number", "ean"])
            params["method"] = faker_method
            
        elif field_type == "distribution":
            st.info("Losuje wartości z podanej listy wg wag.")
            options_str = st.text_input("Opcje (oddzielone przecinkiem)", "NOWY, UŻYWANY, USZKODZONY")
            weights_str = st.text_input("Wagi (oddzielone przecinkiem)", "70, 20, 10")
            
            if options_str:
                params["options"] = [x.strip() for x in options_str.split(",")]
            if weights_str:
                params["weights"] = [float(x.strip()) for x in weights_str.split(",")]

        elif field_type == "llm":
            st.warning("Generuje dane przy użyciu AI (wolniejsze, ale inteligentne).")
            available_fields = [f["name"] for f in st.session_state.schema_fields]
            dependencies = st.multiselect("Zależy od pól (kontekst)", available_fields)
            
            prompt = st.text_area("Szablon promptu", 
                                  value="Napisz krótki opis dla {nazwa_innego_pola}.",
                                  help="Użyj nawiasów klamrowych {} aby wstawić wartości z innych pól.")
            params["prompt_template"] = prompt
            params["model"] = "gpt-4o-mini"

        if st.button("➕ Dodaj pole"):
            if field_name:
                new_field = {
                    "name": field_name,
                    "type": field_type,
                    "params": params,
                    "dependencies": dependencies
                }
                st.session_state.schema_fields.append(new_field)
                st.success(f"Dodano pole: {field_name}")
            else:
                st.error("Podaj nazwę pola!")

with col2:
    st.subheader("3. Twój Schemat")
    if st.session_state.schema_fields:
        for i, field in enumerate(st.session_state.schema_fields):
            with st.expander(f"**{field['name']}** ({field['type']})", expanded=False):
                st.json(field)
                if st.button("Usuń", key=f"del_{i}"):
                    st.session_state.schema_fields.pop(i)
                    st.rerun()
    else:
        st.info("Brak pól. Dodaj coś z lewej strony.")

st.divider()
st.subheader("4. Generowanie")

request_payload = {
    "config": {
        "job_name": job_name,
        "rows_count": rows_count,
        "global_context": global_context,
        "output_format": output_format
    },
    "schema_structure": st.session_state.schema_fields
}

with st.expander("Pokaż surowy JSON żądania (dla debugowania)"):
    st.json(request_payload)

if st.button("🚀 GENERUJ DANE", type="primary", use_container_width=True):
    if not st.session_state.schema_fields:
        st.error("Musisz zdefiniować przynajmniej jedno pole!")
    else:
        with st.spinner('AI pracuje... to może chwilę potrwać...'):
            try:
                response = requests.post("http://127.0.0.1:8000/generate", json=request_payload)
                
                if response.status_code == 200:
                    
                    if output_format == "json":
                        result_json = response.json()
                        data = result_json.get("data", [])
                        st.success("Gotowe!")
                        
                        df = pd.DataFrame(data)
                        st.dataframe(df, use_container_width=True)
                        
                        st.download_button(
                            label="Pobierz JSON",
                            data=json.dumps(data, indent=2),
                            file_name=f"{job_name}.json",
                            mime="application/json"
                        )
                        
                    elif output_format in ["csv", "sql"]:
                        content = response.text
                        st.success("Gotowe! Plik wygenerowany.")
                        st.text_area("Podgląd pliku:", content, height=200)
                        
                        st.download_button(
                            label=f"Pobierz {output_format.upper()}",
                            data=content,
                            file_name=f"{job_name}.{output_format}",
                            mime=f"text/{output_format}"
                        )
                else:
                    st.error(f"Błąd API: {response.status_code}")
                    st.text(response.text)
                    
            except requests.exceptions.ConnectionError:
                st.error("Nie można połączyć się z backendem. Czy uruchomiłeś 'python main.py'?")
            except Exception as e:
                st.error(f"Wystąpił błąd: {e}")