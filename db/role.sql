-- Table: public.role

-- DROP TABLE IF EXISTS public.role;

CREATE TABLE IF NOT EXISTS public.role
(
    id integer NOT NULL DEFAULT nextval('role_id_seq'::regclass),
    title character varying(30) COLLATE pg_catalog."default" NOT NULL,
    salary numeric NOT NULL,
    department_id integer NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT role_title_key UNIQUE (title),
    CONSTRAINT role_department_id_fkey FOREIGN KEY (department_id)
        REFERENCES public.department (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.role
    OWNER to postgres;