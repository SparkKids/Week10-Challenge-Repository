truncate table department CASCADE;
ALTER SEQUENCE department_id_seq RESTART WITH 1;
INSERT INTO department (name)
VALUES  ('Information Technology'),
        ('Engineering'),
        ('Finance'), 
        ('Sales'), 
        ('Legal');
SELECT * FROM department;
truncate table role CASCADE;
ALTER SEQUENCE role_id_seq RESTART WITH 1;
INSERT INTO public.role(
	title, salary, department_id)
	VALUES  ('Sales Lead', 100000, 4),
            ('Salesperson', 80000, 4),
            ('Lead Engineer', 150000, 2),
            ('Software Engineer', 120000, 2),
            ('Account Manager', 160000, 3),
            ('Accountant', 125000, 3),
            ('Legal Team Lead', 250000, 5),
            ('Lawyer', 190000, 5);
SELECT * FROM role;

TRUNCATE TABLE employee;
ALTER SEQUENCE employee_id_seq RESTART WITH 1;
INSERT INTO public.employee(
	first_name, last_name, role_id, manager_id)
	VALUES ('John', 'Doe', 1, NULL),
	 		('Mike', 'Chan', 2, 1),
			('Ashley', 'Rodriguez', 3, NULL),
			('Kevin', 'Tupik', 4, 3),
			('Kunal', 'Singh', 5, NULL),
			('Malia', 'Brown', 6, 5),
			('Sarah', 'Lourd', 7, NULL),
			('John', 'Doe', 8, 7);

    SELECT * FROM employee;
